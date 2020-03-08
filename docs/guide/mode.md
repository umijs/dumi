# 多种呈现模式

目前，dumi 支持两种呈现模式，分别是文档模式和站点模式。在两种模式之间切换也非常地简单：

```ts
// config/config.ts 或 .umirc.ts
export default {
  // 文档模式（默认值）
  mode: 'doc',
  // 站点模式
  mode: 'site',
};
```

在组件库比较轻量、不需要繁杂文档的时候，可以以文档模式呈现；在它羽翼丰满、需要有教程和周边生态时，建议以站点模式呈现。以 dumi 的官网为例展示效果分别如下：

## 文档模式

![](https://gw.alipayobjects.com/zos/bmw-prod/86ddc125-75e0-49e0-920b-f9497e806cf1/k7iyfr0t_w2600_h1754.png)

文档模式的特点是：

- 没有导航头
- 没有搜索框
- 没有定制化的首页
- 支持 `description` 配置项展示简介
- 支持通过 `package.json` 中的 `repository` 配置自动展示 GitHub Stars 数

## 站点模式

![](https://gw.alipayobjects.com/zos/bmw-prod/7ce6770d-df19-48fa-853e-64cbbf41b762/k7iyfarw_w2600_h1754.png)

官网模式的特点是：

- 有导航头
- 有搜索框
- 支持通过 `hero` 和 `features` [配置首页](/config/frontmatter#hero)
- 支持通过 `footer` [配置页脚](/config/frontmatter#footer)
