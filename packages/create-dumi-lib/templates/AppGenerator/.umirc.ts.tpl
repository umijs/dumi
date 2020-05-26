import { defineConfig } from 'dumi';

export default defineConfig({
  title: '{{{ packageName }}}',
{{ #siteMode }}
  mode: 'site',
{{ /siteMode }}
  // more config: https://d.umijs.org/config
});
