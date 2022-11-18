import { defineConfig } from 'dumi';
export default defineConfig({
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  themeConfig: {
    name: '示例',
    hd: {
      // umi-hd 的 750 高清方案（默认值）
      rules: [{ mode: 'vw', options: [100, 750] }],
      // 禁用高清方案
      // rules: [] 或者 不写
      // 根据不同的设备屏幕宽度断点切换高清方案
      // rules: [
      //   { maxWidth: 375, mode: 'vw', options: [100, 750] },
      //   { minWidth: 376, maxWidth: 750, mode: 'vw', options: [100, 1500] },
      // ],
    },
  },
  mfsu: false,
  apiParser: {},
  resolve: { entryFile: './src/index.ts' },
  theme: {
    '@hd': '0.02rem',
  },
});
