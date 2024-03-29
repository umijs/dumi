import * as lexer from 'es-module-lexer';
import hashId from 'hash-sum';
import srcdoc from 'raw-loader!./srcdoc.html';

interface ImportMap {
  imports?: Record<string, string>;
  scopes?: Record<string, string>;
}

export interface ExtendedImportMap extends ImportMap {
  builtins?: Record<string, any>;
}

const MODULE_STORE = '___modules___';

type CodeSandboxWindow = Window & {
  ___modules___: Record<string, any>;
};

interface CodeSandbox {
  destory: () => void;
  exec: (moduleId: string, esm: string) => Promise<any>;
}

function createBlob(source: string) {
  return URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
}

const DEFAULT_RESTRICTIONS = [
  'allow-forms',
  'allow-modals',
  'allow-pointer-lock',
  'allow-popups',
  'allow-same-origin',
  'allow-scripts',
  'allow-top-navigation-by-user-activation',
];

export interface SandboxParams {
  importMap?: ImportMap;
  restrictions?: string[];
  eventPrefix?: string;
}

/**
 * A sandbox for executing ES modules
 *
 * Supports importmap, and can even inject module instances into the sandbox
 * (requires "allow-same-origin" permission)
 *
 * @example
 * ```ts
 * const sandbox = Sandbox.create({
 *  importMap: {
 *    builtins: { 'vue': Module },
 *    imports: {
 *     "lodash": "https://esm.sh/lodash-es",
 *    },
 *    scopes: {},
 *  }
 * });
 * sandbox.exec('import vue from "vue";\nimport lodash from "lodash"');
 * sandbox.updateImportMap({});
 * ```
 */
export class Sandbox {
  private codeSandbox!: Promise<CodeSandbox>;
  private srcdoc: string = srcdoc;

  private depsCache: Record<string, string> = {};
  private moduleCache: Record<string, any> = {};
  private restrictions: string[] = DEFAULT_RESTRICTIONS;
  private eventPrefix: string = 'sandbox';

  static create(params: SandboxParams) {
    return new Sandbox().init(params);
  }

  private listener?: () => void;

  private async init({ importMap, restrictions, eventPrefix }: SandboxParams) {
    if (importMap) {
      this.updateSrcDoc(importMap);
    }
    if (restrictions) {
      this.restrictions = restrictions;
    }
    if (eventPrefix) {
      this.eventPrefix = eventPrefix;
    }
    this.codeSandbox = (async () => {
      await lexer.init;
      return new Promise<CodeSandbox>((resolve, reject) => {
        const initCodeSandbox = () => {
          this.createCodeSandbox().then(resolve).catch(reject);
        };
        if (document.readyState === 'loading') {
          this.listener = initCodeSandbox;
          document.addEventListener('DOMContentLoaded', this.listener, false);
        } else {
          initCodeSandbox();
        }
      });
    })();

    return this;
  }

  async destory() {
    if (this.listener) {
      document.removeEventListener('DOMContentLoaded', this.listener, false);
    }
    return this.codeSandbox.then(({ destory }) => {
      destory();
    });
  }

  private createCodeSandbox() {
    return new Promise<CodeSandbox>((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.sandbox.add(...this.restrictions);
      const iframeLoaded = () => {
        const iframeWindow = iframe.contentWindow as CodeSandboxWindow;
        iframeWindow[MODULE_STORE] = this.moduleCache;
        resolve({
          destory: () => {
            this.moduleCache = {};
            iframe.remove();
          },
          exec: (moduleId: string, esm: string) => {
            return new Promise((execResolve, execReject) => {
              const handleMessage = (e: MessageEvent) => {
                const { data } = e;
                if (data.type?.startsWith(`${this.eventPrefix}.esm.done`)) {
                  window.removeEventListener('message', handleMessage);
                  execResolve(this.moduleCache[moduleId]);
                } else if (
                  data.type?.startsWith(`${this.eventPrefix}.esm.error`)
                ) {
                  execReject(data.error);
                }
              };
              window.addEventListener('message', handleMessage, false);
              iframeWindow.postMessage({ esm }, '*');
            });
          },
        });
      };
      iframe.addEventListener(
        'load',
        () => {
          if (iframe.contentWindow) {
            iframeLoaded();
          } else {
            reject('missing contentWindow');
          }
        },
        false,
      );

      iframe.addEventListener(
        'error',
        (e) => {
          reject(e.error);
        },
        false,
      );

      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      iframe.srcdoc = this.srcdoc;
      (document.body ?? document.head).appendChild(iframe);
      if (iframe.contentWindow) {
        (iframe.contentWindow as any)[MODULE_STORE] = this.moduleCache;
      }
    });
  }

  private rewriteExports(moduleId: string, esm: string) {
    const [, exports] = lexer.parse(esm);
    for (const e of exports) {
      if (e.n === 'default') {
        // export default or export { s as default }
        if (e.ln) {
          // todo
        } else {
          const exportStatementStart = esm.lastIndexOf('export', e.s);
          if (exportStatementStart >= 0) {
            const rewriteEsm =
              esm.substring(0, exportStatementStart) +
              'const $$$default = ' +
              esm.substring(e.e) +
              `window.${MODULE_STORE}['${moduleId}'] = { 'default': $$$default };
              parent.postMessage({ type: '${this.eventPrefix}.esm.done' }, '*');`;
            const url = createBlob(rewriteEsm);

            return `(async function() {
              try {
                await import('${url}');
              } catch(e) {
                parent.postMessage({ type: '${this.eventPrefix}.esm.error', error: e });
              }
            })()`;
          }
        }
      }
    }
    return esm;
  }

  private updateSrcDoc({ imports, builtins, scopes }: ExtendedImportMap) {
    const realImportMap: ImportMap = {};
    if (imports) {
      realImportMap.imports = imports;
    }
    if (scopes) {
      realImportMap.scopes = scopes;
    }
    if (builtins) {
      realImportMap.imports = Object.entries(builtins).reduce(
        (acc, [identifier, module]) => {
          const depCache = this.depsCache[identifier];
          if (depCache) {
            acc[identifier] = depCache;
            return acc;
          }
          let source = '';
          let hasDefault = false;
          Object.keys(module).forEach((member) => {
            const chain = `window.${MODULE_STORE}?.['${identifier}']?.['${member}']`;
            if (member === 'default') {
              hasDefault = true;
            }
            source +=
              member === 'default'
                ? `const $$$default = ${chain}; export default $$$default;`
                : `export const ${member} = ${chain};`;
          });
          if (!hasDefault) {
            source += `const $$$default = window.${MODULE_STORE}?.['${identifier}']; export default $$$default;`;
          }
          acc[identifier] = createBlob(source);
          this.moduleCache[identifier] = module;
          this.depsCache[identifier] = acc[identifier];
          return acc;
        },
        realImportMap.imports ?? {},
      );
    }

    const replacements: Record<string, string> = {
      importmap: JSON.stringify(realImportMap),
      eventPrefix: this.eventPrefix,
    };
    this.srcdoc = (srcdoc as string).replace(
      /\{(\w+)\}/gi,
      (_, key) => replacements[key] || '',
    );
  }

  async updateImportMap(importMap: ExtendedImportMap) {
    this.updateSrcDoc(importMap);
    this.codeSandbox = this.codeSandbox
      .then((codeSandbox) => {
        codeSandbox.destory();
      })
      .then(this.createCodeSandbox);
  }

  async exec(esm: string) {
    const moduleId = `module_${hashId(esm)}`;
    const result = this.moduleCache[moduleId];
    if (result) return result;
    const codeSandbox = await this.codeSandbox;
    const moduleInstance = await codeSandbox.exec(
      moduleId,
      this.rewriteExports(moduleId, esm),
    );
    return moduleInstance;
  }
}
