import type { BabelCore } from 'dumi/bundler-utils';
import { babelCore, babelPresetTypeScript } from 'dumi/bundler-utils';
import * as path from 'path';
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
import { VueBabelJsxPlugin } from '../../constants';

const { transformSync } = babelCore();

function transform(src: string, filename: string, lang?: string) {
  const plugins: BabelCore.PluginItem[] = [];
  const presets: BabelCore.PluginItem[] = [];
  if (lang === 'ts' || lang === 'tsx') {
    const isTSX = lang === 'tsx';
    presets.push([
      babelPresetTypeScript(),
      { isTSX, allExtensions: isTSX, onlyRemoveTypeImports: true },
    ]);
  }
  if (lang === 'tsx' || lang === 'jsx') {
    plugins.push(VueBabelJsxPlugin);
  }

  const result = transformSync(src, {
    filename: path.join(
      path.dirname(filename),
      path.basename(filename) + '.' + (lang || 'ts'),
    ),
    presets,
    plugins,
  });
  return result?.code || '';
}

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

export const COMP_IDENTIFIER = '__sfc__';

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
      sfcCode = transform(
        rewriteDefault(content, COMP_IDENTIFIER, expressionPlugins),
        filename,
        lang,
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

    code = transform(code, filename, lang);
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

export function compileSFC(options: CompileOptions): CompileResult {
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
    js += `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)};`;
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
