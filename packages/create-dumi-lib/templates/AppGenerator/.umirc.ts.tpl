import { defineConfig } from 'dumi';

export default defineConfig({
  title: '{{{ packageName }}}',
  publicPath: './',
  favicon: undefined, //输入图片链接修改
  logo: undefined, //输入图片链接修改
  {{ #siteMode }}
  mode: 'site',
  {{ /siteMode }}
  // more config: https://d.umijs.org/config
});
