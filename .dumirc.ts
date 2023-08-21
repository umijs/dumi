import { defineConfig } from './dist';
import { version } from './package.json';

export default defineConfig({
  html2sketch: {},
  favicons: [
    'https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4g3_w256_h256.png',
  ],
  autoAlias: false,
  outputPath: 'docs-dist',
  define: {
    'process.env.DUMI_VERSION': version,
  },
  themeConfig: {
    hd: { rules: [] },
    rtl: true,
    name: 'dumi',
    logo: 'https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4g3_w256_h256.png',
    footer: `Open-source MIT Licensed | Copyright © 2019-present
<br />
Powered by self`,
    prefersColor: { default: 'auto' },
    socialLinks: {
      github: 'https://github.com/umijs/dumi',
    },
  },
  ...(process.env.NODE_ENV === 'development' ? {} : { ssr: {} }),
  analytics: {
    ga_v2: 'G-GX2S89BMXB',
  },
  sitemap: { hostname: 'https://d.umijs.org' },
});
