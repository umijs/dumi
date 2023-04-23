---
group: 介绍
---

# 移动端组件研发主题

针对移动端组件研发场景，dumi 基于默认主题提供了移动端组件研发主题，具备以下特性：

1. 移动端设备尺寸的 demo 预览，强制以 [iframe](/config/demo#iframe) 模式加载
2. 基于 [umi-hd](https://github.com/umijs/umi-hd) 的 H5 高清方案
3. 支持默认主题的全部特性，包括站点配置项及 demo 的 [compact](/config/demo#compact)[、background](/config/demo#background) 等配置项
4. demo 预览器支持响应式降级为默认主题模式

预览效果可访问 [指南 - 移动端组件研发](/guide/mobile-library) 查看。

## 站点配置

移动端组件研发主题提供了如下站点配置项，均在 `.dumirc.ts` 中的 `themeConfig` 配置项中配置。

### hd

- 类型：`{ rules: umiHDConfig[] }`
- 默认值：`{ rules: [{ mode: 'vw', options: [100, 750] }] }`

配置 demo 渲染的高清方案，默认为 750 高清方案，支持的配置项值请参考[类型定义](https://github.com/umijs/dumi/blob/master/suites/theme-mobile/src/types.ts#L7)。

配置为空数组时可禁用 umi-hd 高清方案：

```ts
export default {
  themeConfig: {
    hd: { rules: [] },
  },
};
```

也可以根据不同设备屏幕宽度切换高清方案：

```ts
export default {
  themeConfig: {
    hd: {
      rules: [
        { maxWidth: 375, mode: 'vw', options: [100, 750] },
        { minWidth: 376, maxWidth: 750, mode: 'vw', options: [100, 1500] },
      ],
    },
  },
};
```

### deviceWidth

- 类型：`number`
- 默认值：`375`

配置 demo 预览器右侧设备的宽度，必须为数值，设备宽高比始终保持为 `1.78`。

<embed src="../theme/default.md#RE-/<!-- site config[^]+ site config end -->/"></embed>

## Markdown 配置

默认主题提供了如下 Markdown 配置项，用于首页展示。

### mobile

- 类型：`boolean`
- 默认值：`true`

配置为 `false` 时可将当前页面的 demo 预览切换回默认主题模式。

<embed src="../theme/default.md#RE-/<!-- md config[^]+ md config end -->/"></embed>
