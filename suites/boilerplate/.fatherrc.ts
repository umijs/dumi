import { version } from '../../package.json';

export default {
  cjs: { output: 'dist' },
  define: {
    // replace process.env.DUMI_VERSION to current version
    'process.env.DUMI_VERSION': JSON.stringify(`^${version}`),
  },
};
