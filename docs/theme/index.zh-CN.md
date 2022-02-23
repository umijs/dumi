---
title: 主题列表
order: 1
toc: menu
nav:
  title: 主题
  order: 2
---

## `dumi-theme-default`

- **仓库地址：** [dumi/packages/theme-default](https://github.com/umijs/dumi/tree/master/packages/theme-default)
- **体验地址：** [dumi 官网](https://d.umijs.org)
- **主题简介：** dumi 的内置主题

## `dumi-theme-mobile`

- **仓库地址：** [dumi/packages/theme-mobile](https://github.com/umijs/dumi/tree/master/packages/theme-mobile)
- **体验地址：**（缺失）
- **主题简介：** 基于 dumi 默认主题扩展的移动端研发主题，特性如下：
  1. sticky 手机模拟容器 + iframe 预览 demo
  2. 基于 [umi-hd](https://github.com/umijs/umi-hd) 为 demo 预览提供 `viewport` 和 root `font-size` 的自动设置
  3. 提供二维码便于真机预览

<img style="border: 1px solid #eee;" src="https://gw.alipayobjects.com/zos/bmw-prod/acb29a94-6200-4798-82eb-190177fa841c/kezwf18r_w2556_h1396.jpeg" alt="移动端主题预览效果" />

需要注意的是，如果使用 rem 的响应式方案，在样式源代码中也要采用 rem 单位，建议参考 antd-mobile 的方案，设置 Less 变量[作为基础单位](https://github.com/ant-design/ant-design-mobile/blob/next/packages/antd-mobile-styles/src/base/variables.less#L4)，再根据需要[在编译时配置高清变量](https://github.com/ant-design/ant-design-mobile/blob/next/config/config.ts#L96)控制最终渲染值。

高清方案可以在 dumi 配置文件中通过 `themeConfig` 配置项切换，配置方式如下：

```ts
// .umirc.ts
export default {
  // ...
  themeConfig: {
    carrier: 'dumi', // 设备状态栏左侧的文本内容
    hd: {
      // umi-hd 的 750 高清方案（默认值）
      rules: [{ mode: 'vw', options: [100, 750] }],
      // 禁用高清方案
      rules: [],
      // 根据不同的设备屏幕宽度断点切换高清方案
      rules: [
        { maxWidth: 375, mode: 'vw', options: [100, 750] },
        { minWidth: 376, maxWidth: 750, mode: 'vw', options: [100, 1500] },
      ],
      // 更多 rule 配置访问 https://github.com/umijs/dumi/blob/master/packages/theme-mobile/src/typings/config.d.ts#L7
    }
  }
}
```

_注：如果希望在启用移动端主题后，在某些页面仍采用默认模式展示组件 demo，可以在 Markdown 的 frontmatter 中设置 `mobile: false` 切换：_

```md
---
mobile: false
---

Markdown 正文
```

## `dumi-theme-tuya`

- **仓库地址：** https://github.com/youngjuning/dumi-theme-tuya
- **文档地址：** https://dumi-theme-tuya.js.org/dumi-theme-tuya/
- **体验地址：** [Tuya Design](https://panel-docs.tuyacn.com/)
- **主题简介：** 涂鸦文档平台主题

## 虚位以待

如果你创建了不错的 dumi 主题、想分享给大家使用，请将你的主题信息通过 Pull Request [更新到此文档](https://github.com/umijs/dumi/edit/master/docs/theme/index.zh-CN.md)。
