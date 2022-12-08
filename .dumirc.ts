export default {
  favicons: [
    'https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4g3_w256_h256.png',
  ],
  autoAlias: false,
  outputPath: 'docs-dist',
  themeConfig: {
    rtl: true,
    name: 'dumi',
    logo: 'https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4g3_w256_h256.png',
    footer: `Open-source MIT Licensed | Copyright © 2019-present
<br />
Powered by self`,
  },
  ssr: process.env.NODE_ENV === 'development' ? false : {},
  sitemap: { hostname: 'https://d.umijs.org' },
  apiParser: {},
  resolve: {
    entryFile: './docs/guide/demos/entry.tsx',
  },
};
