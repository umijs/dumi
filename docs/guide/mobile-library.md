---
group: 进阶
order: 2
---

# 移动端组件研发

## 启用方式

与 dumi 1 一样，只需要安装移动端组件研发主题即可切换到移动端组件研发模式：

```bash
$ npm i dumi-theme-mobile@^2.0.0 -D
```

然后可以通过 `themeConfig` 配置该主题包的行为：

```ts
export default {
  themeConfig: {
    // 配置高清方案，默认为 750 高清方案
    hd: {
      rules: [...],
    },
    // 配置 demo 预览器的设备宽度，默认为 375px
    deviceWidth: 375,
  },
}
```

关于该主题包的更多介绍及配置项使用方式，可以访问 [移动端组件研发主题](/theme/mobile) 了解更多。

## 效果预览

```tsx
/**
 * title: demo 预览器示例
 * description: |
 *  和默认主题一样可以为 demo 配置介绍文案。
 *
 *  且相较 dumi 1 新增了 `compact`（配置为 `true` 时没有内边距）和 `background`（修改背景色）配置项的支持。
 */
import React from 'react';

export default () => (
  <button
    type="button"
    style={{
      padding: '6px 14px',
      color: '#fff',
      border: 0,
      background: '#1677ff',
    }}
  >
    主按钮
  </button>
);
```
