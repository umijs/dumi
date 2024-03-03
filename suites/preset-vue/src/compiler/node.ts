import {
  babelCore,
  babelPresetEnv,
  babelPresetTypeScript,
} from 'dumi/tech-stack-utils';
import { COMP_IDENTIFIER, createCompiler, type CompileOptions } from './index';

const babel = babelCore();
const env = babelPresetEnv();
const typescript = babelPresetTypeScript();

export const compiler = createCompiler({
  babel,
  availablePlugins: {
    'vue-jsx': require.resolve('../../compiled/@vue/babel-plugin-jsx'),
  },
  availablePresets: { env, typescript },
});

export function compile(options: CompileOptions) {
  const { id, filename, code } = options;
  const [, lang] = filename.match(/[^.]+\.([^.]+)$/) || [];
  if (['js', 'jsx', 'ts', 'tsx'].includes(lang)) {
    return compiler.transformTS(code, filename, { lang });
  }
  const compiled = compiler.compileSFC(options);

  if (Array.isArray(compiled)) {
    return compiled;
  }
  let { js, css } = compiled;
  if (css) {
    js += `\n${COMP_IDENTIFIER}.__css__ = ${JSON.stringify(css)};`;
  }
  js += `\n${COMP_IDENTIFIER}.__id__ = "${id}";
    export default ${COMP_IDENTIFIER};`;
  return js;
}
