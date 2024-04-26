import type { BabelCore, babelCore } from 'dumi/tech-stack-utils';
import {
  CompilerError,
  CompilerOptions,
  SFCDescriptor,
  compileScript,
  compileStyle,
  compileTemplate,
  parse,
  rewriteDefault,
} from 'vue/compiler-sfc';

export interface CompileOptions {
  id: string;
  filename: string;
  code: string;
}

export type CompileResult =
  | (string | CompilerError | SyntaxError)[]
  | {
      js: string;
      css: string;
    };

export function resolveFilename(filename: string) {
  const [, basename, lang] = filename.match(/([^.]+)\.([^.]+)$/) || [];
  return { basename, lang };
}
type Plugins = Record<string, BabelCore.PluginItem>;

type CreateCompilerContext = {
  babel: ReturnType<typeof babelCore>;
  availablePlugins?: Plugins;
  availablePresets?: Plugins;
};

export const COMP_IDENTIFIER = '__sfc__';

export function createCompiler({
  babel,
  availablePlugins = {},
  availablePresets = {},
}: CreateCompilerContext) {
  function toCommonJS(es: string) {
    return babel.transformSync(es, {
      presets: [[availablePresets['env'] ?? 'env', { modules: 'cjs' }]],
    });
  }

  function transformTS(
    src: string,
    filename: string,
    options: {
      lang?: string;
      plugins?: BabelCore.PluginItem[];
      presets?: BabelCore.PluginItem[];
    } = {},
  ) {
    const { lang, plugins = [], presets = [] } = options;
    if (lang === 'ts' || lang === 'tsx') {
      const isTSX = lang === 'tsx';
      presets.push([
        availablePresets['typescript'] ?? 'typescript',
        { isTSX, allExtensions: isTSX, onlyRemoveTypeImports: true },
      ]);
    }
    if (lang === 'tsx' || lang === 'jsx') {
      plugins.push(availablePlugins['vue-jsx'] ?? 'vue-jsx');
    }

    const { basename } = resolveFilename(filename);
    const result = babel.transformSync(src, {
      filename: basename + '.' + (lang || 'ts'),
      presets,
      plugins,
    });
    return result?.code || '';
  }

  function doCompileScript(
    id: string,
    descriptor: SFCDescriptor,
    hasScoped: boolean,
    lang?: string,
  ) {
    const { filename, template, scriptSetup, script } = descriptor;
    const templateContent = template?.content;

    const hasSetup = !!scriptSetup;

    const isTS = lang === 'ts' || lang === 'tsx';

    const expressionPlugins: CompilerOptions['expressionPlugins'] = [];
    if (isTS) expressionPlugins.push('typescript');
    if (lang === 'jsx' || lang === 'tsx') expressionPlugins.push('jsx');

    let sfcCode = '';
    if (script || scriptSetup) {
      try {
        const { content } = compileScript(descriptor, {
          id,
          inlineTemplate: hasSetup,
          templateOptions: {
            compilerOptions: { expressionPlugins },
          },
        });
        sfcCode = transformTS(
          rewriteDefault(content, COMP_IDENTIFIER, expressionPlugins),
          filename,
          { lang },
        );
      } catch (error) {
        return [error] as CompilerError[];
      }
    } else {
      sfcCode = `const ${COMP_IDENTIFIER} = {};`;
    }
    if (!hasSetup && templateContent) {
      let { code, errors } = compileTemplate({
        id,
        filename,
        source: templateContent,
        scoped: hasScoped,
        compilerOptions: { expressionPlugins },
      });

      if (errors.length) {
        return errors;
      }

      code = transformTS(code, filename, { lang });
      sfcCode += `\n${code.replace(
        /\nexport (function|const) render/,
        `$1 render`,
      )}
      ${COMP_IDENTIFIER}.render = render;`;
    }

    return sfcCode;
  }

  function doCompileStyle(id: string, descriptor: SFCDescriptor) {
    const { filename } = descriptor;
    const styleList: string[] = [];
    for (const style of descriptor.styles) {
      const { code, errors } = compileStyle({
        source: style.content,
        filename,
        id,
        scoped: style.scoped,
      });
      if (errors.length) {
        return errors;
      }
      styleList.push(code);
    }
    return styleList.join('\n');
  }

  function compileSFC(options: CompileOptions): CompileResult {
    const { id, code, filename } = options;
    const { descriptor, errors } = parse(code, { filename });
    if (errors.length) {
      return errors;
    }

    let js = '';
    let skipStyleCompile = false;
    if (
      descriptor.styles.some((style) => style.lang) ||
      (descriptor.template && descriptor.template.lang)
    ) {
      skipStyleCompile = true;
      js +=
        '\nconsole.warn("Custom preprocessors ' +
        'for <template> and <style> are not supported in the Codeblock.")';
    }

    if (descriptor.styles.some((style) => style.module)) {
      skipStyleCompile = true;
      js +=
        '\nconsole.warn("<style module> is not supported in the the Codeblock.")';
    }

    const scriptLang =
      (descriptor.script && descriptor.script.lang) ||
      (descriptor.scriptSetup && descriptor.scriptSetup.lang);

    const hasScoped = descriptor.styles.some((style) => style.scoped);

    const scriptResult = doCompileScript(
      id,
      descriptor,
      hasScoped,
      scriptLang || '',
    );
    if (Array.isArray(scriptResult)) {
      return scriptResult;
    }

    js += `\n${scriptResult}`;
    if (hasScoped) {
      js += `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(
        `data-v-${id}`,
      )};`;
    }
    let css = '';
    if (!skipStyleCompile) {
      const styleResult = doCompileStyle(id, descriptor);
      if (Array.isArray(styleResult)) {
        return styleResult;
      }
      css = styleResult;
    }
    return { js, css };
  }

  return {
    toCommonJS,
    transformTS,
    compileSFC,
  };
}
