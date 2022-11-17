export default {
  autoAlias: false,
  outputPath: 'docs-dist',
  themeConfig: {
    rtl: true,
    name: 'dumi',
    footer: `Open-source MIT Licensed | Copyright © 2019-present
<br />
Powered by self`,
  },
  ssr: process.env.NODE_ENV === 'development' ? false : {},
};
