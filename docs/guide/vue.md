---
title: 使用Vue.js
group: 基础
order: 7
---

# 使用 Vue.js

本文介绍如何在 dumi 中使用 Vue.js

## 安装

```bash
pnpm i dumi-plugin-vue
```

## 配置

```ts
// .dumirc.ts
export default {
  plugins: ['dumi-plugin-vue'],
};
```

## 插件选项

### globalInject

全局脚本注入

Vue 的 UI 框架通常都有全局导入的功能，以 ElementPlus 为例，我们可以通过以下配置将 ElementPlus 全局导入

```ts
// .dumirc.ts
export default {
  plugins: ['dumi-plugin-vue'],
  themeConfig: {
    vue: {
      globalInject: {
        imports: `
          import ElementPlus from 'element-plus';
          import 'element-plus/dist/index.css';
        `,
        statements: `app.use(ElementPlus, { size: 'small', zIndex: 3000 });`,
      },
    },
  },
};
```
