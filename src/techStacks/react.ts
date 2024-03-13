import { createTechStack, wrapDemoWithFn } from './utils';

export const ReactTechStack = createTechStack({
  name: 'react',

  runtimeOpts: {
    compilePath: require.resolve('../client/misc/reactDemoCompiler'),
  },

  isSupported(lang) {
    return ['jsx', 'tsx'].includes(lang);
  },

  transformCode(raw, opts) {
    if (opts.type === 'code-block') {
      const isTSX = opts.fileAbsPath.endsWith('.tsx');
      const code = wrapDemoWithFn(raw, {
        filename: opts.fileAbsPath,
        parserConfig: {
          syntax: isTSX ? 'typescript' : 'ecmascript',
          [isTSX ? 'tsx' : 'jsx']: true,
        },
      });
      return `React.memo(React.lazy(${code}))`;
    }
    return raw;
  },
});
