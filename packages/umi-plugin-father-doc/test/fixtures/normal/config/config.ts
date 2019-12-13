import { join } from 'path';
import { IConfig } from 'umi-types';

export default {
  // for GitHub Pages before prerender be supported
  history: 'hash',
  publicPath: '/',
  doc: {
    title: 'father-doc',
  },
  plugins: [
    join(__dirname,'../../../../lib/index.js'),
  ],
} as IConfig;
