import { BABEL_STANDALONE_CDN } from '@/shared';
import type { IApi } from 'umi';
import VueJSXTechStack from './jsx';
import VueSfcTechStack from './sfc';

export default function registerTechStack(api: IApi) {
  const vueConfig = api.userConfig?.vue;

  // mark @babel/standalone and typescript as external
  api.modifyConfig((memo) => {
    memo.externals = {
      ...memo.externals,
      '@babel/standalone': 'Babel',
      typescript: 'typescript',
    };
    return memo;
  });

  api.addHTMLHeadScripts(() => {
    return [
      {
        src: vueConfig?.compiler?.babelStandaloneCDN || BABEL_STANDALONE_CDN,
        async: true,
      },
      {
        src: 'https://cdn.bootcdn.net/ajax/libs/typescript/5.2.2/typescript.min.js',
        async: true,
      },
    ];
  });

  // TODO: 暂时无法知道如何在所有techStack注册完之后，再执行runtimePlugin，暂时利用这行代码
  api.addRuntimePlugin(() =>
    require.resolve('@dumijs/preset-vue/lib/runtimePlugin.mjs', {
      paths: [process.cwd()],
    }),
  );

  api.register({
    key: 'registerTechStack',
    stage: 0,
    fn: () => new VueJSXTechStack(),
  });

  api.register({
    key: 'registerTechStack',
    stage: 1,
    fn: () => new VueSfcTechStack(),
  });
}
