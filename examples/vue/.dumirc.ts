// import AutoImport from 'unplugin-auto-import/webpack';
// import Components from 'unplugin-vue-components/webpack';
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'node:path';
export default {
  apiParser: {},
  resolve: {
    entryFile: './src/index.ts',
  },
  html2sketch: {},
  presets: [require.resolve('@dumijs/preset-vue')],
  vue: {
    tsconfigPath: path.resolve(__dirname, './tsconfig.vue.json'),
    checkerOptions: {
      externalSymbolLinkMappings: {
        typescript: {
          Promise:
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
        },
        '@vue/runtime-core': {
          VNodeChild:
            'https://github.com/vuejs/core/blob/main/packages/runtime-core/src/vnode.ts#L136',
        },
      },
    },
  },
  themeConfig: {
    nav: [
      { title: 'SFC', link: '/components/foo' },
      { title: 'JSX', link: '/components/button' },
      { title: '3rd party framework', link: '/framework-test' },
    ],
  },
  chainWebpack(memo: any) {
    memo.plugin('unplugin-element-plus').use(
      require('unplugin-element-plus/webpack')({
        useSource: true,
      }),
    );
    // memo.plugin('auto-import').use(AutoImport( {
    //   resolvers: [ElementPlusResolver()],
    // }));
    // memo.plugin('components').use(Components({
    //   resolvers: [ElementPlusResolver()],
    // }));
    return memo;
  },
};
