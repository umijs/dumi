import * as lexer from 'es-module-lexer';
import hashId from 'hash-sum';

const srcdoc = `
<!doctype html>
<html>
<head>
  <script>
    (function () {
      let scriptEls = [];
      function handleMessage(e) {
        if (scriptEls.length) {
          scriptEls.forEach((el) => {
            document.body.removeChild(el);
          });
          scriptEls = [];
        }
        const { esm } = e.data;
        const scriptEl = document.createElement('script');
        scriptEl.setAttribute('type', 'module');
        scriptEl.innerHTML = esm;
        scriptEl.onerror = function(error) {
          parent.postMessage({ type: '{eventPrefix}.esm.error', error });
        };
        document.body.appendChild(scriptEl);
        scriptEls.push(scriptEl);
      }
      window.addEventListener('message', handleMessage, false);

    })()
  </script>
  <script type="importmap">
    {importmap}
  </script>
</head>
<body>
</body>
</html>
`;
interface ImportMap {
  imports?: Record<string, string>;
  scopes?: Record<string, string>;
}

export interface ExtendedImportMap<T = any> extends ImportMap {
  builtins?: Record<string, T>;
}

const MODULE_STORE = '___modules___';

type CodeSandboxWindow = Window & {
  ___modules___: Record<string, any>;
};

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

export function rewriteExports(
  moduleId: string,
  esm: string,
  eventPrefix: string,
) {
  const [, exports] = lexer.parse(esm);
  for (const e of exports) {
    if (e.n === 'default') {
      let rewriteEsm = '';
      let defaultSymbol = '';
      // export default or export { s as default }
      if (e.ln) {
        rewriteEsm = esm.substring(0, e.ls) + esm.substring(e.e);
        defaultSymbol = e.ln;
      } else {
        const exportStatementStart = esm.lastIndexOf('export', e.s);
        if (exportStatementStart >= 0) {
          rewriteEsm =
            esm.substring(0, exportStatementStart) +
            `const ${moduleId} = ` +
            esm.substring(e.e);
          defaultSymbol = moduleId;
        }
      }
      if (rewriteEsm && defaultSymbol) {
        const url = createBlob(
          rewriteEsm +
            `\nwindow.${MODULE_STORE}['${moduleId}'] = { 'default': ${defaultSymbol} };` +
            `\nparent.postMessage({ type: '${eventPrefix}.esm.done' }, '*');`,
        );
        return `(async function() {
          try {
            await import('${url}');
          } catch(e) {
            parent.postMessage({ type: '${eventPrefix}.esm.error', error: e });
          }
        })()`;
      }
    }
  }
  return esm;
}

class IFrameContainer {
  private iframe!: HTMLIFrameElement;
  private iframeWindow!: CodeSandboxWindow;
  constructor(
    private restrictions: string[],
    private moduleCache: Record<string, any>,
    private eventPrefix: string,
  ) {}
  async create(srcdoc: string) {
    return new Promise<IFrameContainer>((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.sandbox.add(...this.restrictions);
      const iframeLoaded = () => {
        this.iframeWindow = iframe.contentWindow as CodeSandboxWindow;
        this.iframeWindow[MODULE_STORE] = this.moduleCache;
        resolve(this);
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
      iframe.srcdoc = srcdoc;
      (document.body ?? document.head).appendChild(iframe);
      this.iframe = iframe;
      if (iframe.contentWindow) {
        (iframe.contentWindow as any)[MODULE_STORE] = this.moduleCache;
      }
    });
  }

  exec(moduleId: string, esm: string) {
    return new Promise<any>((execResolve, execReject) => {
      const handleMessage = (e: MessageEvent) => {
        const { data } = e;
        if (data.type?.startsWith(`${this.eventPrefix}.esm.done`)) {
          window.removeEventListener('message', handleMessage);
          execResolve(this.moduleCache[moduleId]);
        } else if (data.type?.startsWith(`${this.eventPrefix}.esm.error`)) {
          execReject(data.error);
        }
      };
      window.addEventListener('message', handleMessage, false);
      this.iframeWindow.postMessage({ esm }, '*');
    });
  }

  destroy() {
    this.moduleCache = {};
    this.iframe.remove();
  }
}

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
 * const sandbox = await Sandbox.create({
 *  importMap: {
 *    builtins: { 'vue': Module },
 *    imports: {
 *     "lodash": "https://esm.sh/lodash-es",
 *    },
 *    scopes: {},
 *  }
 * });
 * await sandbox.exec('import vue from "vue";\nimport lodash from "lodash"');
 * await sandbox.updateImportMap({});
 * ```
 */
export class Sandbox {
  private codeSandbox!: Promise<IFrameContainer>;
  private srcdoc: string = srcdoc;

  private moduleCache: Record<string, any> = {};
  private restrictions: string[] = DEFAULT_RESTRICTIONS;
  private eventPrefix: string = 'sandbox';

  static create(params?: SandboxParams) {
    return new Sandbox().init(params || {});
  }

  private contentLoadedListener?: () => void;

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
      return new Promise<IFrameContainer>((resolve, reject) => {
        const initCodeSandbox = () => {
          const container = new IFrameContainer(
            this.restrictions,
            this.moduleCache,
            this.eventPrefix,
          );
          container.create(this.srcdoc).then(resolve).catch(reject);
        };
        if (document.readyState === 'loading') {
          this.contentLoadedListener = initCodeSandbox;
          document.addEventListener(
            'DOMContentLoaded',
            this.contentLoadedListener,
            false,
          );
        } else {
          initCodeSandbox();
        }
      });
    })();

    await this.codeSandbox;
    return this;
  }

  async destory() {
    if (this.contentLoadedListener) {
      document.removeEventListener(
        'DOMContentLoaded',
        this.contentLoadedListener,
        false,
      );
    }
    return this.codeSandbox.then((codeSandbox) => {
      return codeSandbox.destroy();
    });
  }

  private updateSrcDoc({ imports, builtins, scopes }: ExtendedImportMap) {
    const realImportMap: ImportMap = {};
    if (imports) {
      realImportMap.imports = {
        ...imports,
      };
    }
    if (scopes) {
      realImportMap.scopes = {
        ...scopes,
      };
    }
    if (builtins) {
      realImportMap.imports = Object.entries(builtins).reduce(
        (acc, [identifier, module]) => {
          let source =
            `const modules = window.${MODULE_STORE} || {};` +
            `\nconst m = modules['${identifier}'] || {}`;
          let hasDefault = false;
          Object.keys(module).forEach((member) => {
            if (member === 'default') {
              hasDefault = true;
            }
            source +=
              member === 'default'
                ? `\nexport default m['${member}']`
                : `\nexport const ${member} = m['${member}'];`;
          });
          if (!hasDefault) {
            source += `\nexport default m;`;
          }
          const blob = createBlob(source);
          acc[identifier] = blob;
          this.moduleCache[identifier] = module;
          return acc;
        },
        realImportMap.imports ?? {},
      );
    }

    const replacements: Record<string, string> = {
      importmap: JSON.stringify(realImportMap),
      eventPrefix: this.eventPrefix,
    };
    this.srcdoc = srcdoc.replace(
      /\{(\w+)\}/gi,
      (_, key) => replacements[key] || '',
    );
  }

  async updateImportMap(importMap: ExtendedImportMap) {
    this.codeSandbox = this.codeSandbox
      .then((codeSandbox) => {
        codeSandbox.destroy();
        this.updateSrcDoc(importMap);
      })
      .then(() => {
        const container = new IFrameContainer(
          this.restrictions,
          this.moduleCache,
          this.eventPrefix,
        );
        return container.create(this.srcdoc);
      });
    await this.codeSandbox;
  }

  async exec(esm: string) {
    const moduleId = `module_${hashId(esm)}`;
    const result = this.moduleCache[moduleId];
    if (result) return result;
    const codeSandbox = await this.codeSandbox;
    return codeSandbox.exec(
      moduleId,
      rewriteExports(moduleId, esm, this.eventPrefix),
    );
  }
}
