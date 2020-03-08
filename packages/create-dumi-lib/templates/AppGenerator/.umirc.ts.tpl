import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'Library Name',
{{ #siteMode }}
  mode: 'site',
{{ /siteMode }}
  // more config: https://d.umijs.org/config
});
