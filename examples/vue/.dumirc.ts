// import AutoImport from 'unplugin-auto-import/webpack';
// import Components from 'unplugin-vue-components/webpack';
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default {
  mfsu: false,
  apiParser: {},
  resolve: {
    entryFile: './src/index.ts',
  },
  plugins: ['dumi-plugin-vue'],
  themeConfig: {
    nav: [
      { title: 'SFC', link: '/components/foo' },
      { title: 'JSX', link: '/components/button' },
      { title: '3rd party framework', link: '/framework-test' },
    ],
    // vue: {
    //   globalInject: {
    //     imports: `
    //     import ElementPlus from 'element-plus';
    //     import 'element-plus/dist/index.css';
    //     `,
    //     statements: `app.use(ElementPlus, { size: 'small', zIndex: 3000 });`
    //   },
    // },
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
