---
order: 1
nav:
  order: 2
  title: 配置项
---

# Config

dumi 基于 Umi，配置的方式与 Umi 项目一致，使用 `.umirc.js` 或 `config/config.js` 都可进行配置，内容大致如下：

```js
// 配置文件内容
export default {
  // 配置项
};
```

## mode

- 类型：`doc | site`
- 默认值：`doc`
- 详细：

用于设定文档的展现模式，默认为文档模式（左侧菜单 + 右侧内容），配置为 `site` 时可无缝切换为站点模式（导航头 + 左侧菜单 + 右侧内容）。如果希望对导航菜单项展示的文本和顺序，可参考 frontmatter 配置中的 `nav` 配置项。

## title

- 类型：`String`
- 默认值：`package.name`
- 详细：

配置文档的名称，通常是所开发的组件的名称。

## desc

- 类型：`String`
- 默认值：`null`
- 详细：

配置文档的介绍，会显示在侧边栏菜单标题的下方，仅 `doc` 模式下可用。

## logo

- 类型：`String`
- 默认值：Umi 的 LOGO
- 详细：

配置文档的 LOGO。

## locales

- 类型：`Array<[String, String]>`
- 默认值：`[['en-US', 'EN'], ['zh-CN', '中文']]`
- 详细：

该配置为二维数组，第一项配置会作为站点默认的 locale。

每一项配置是一个长度为 2 的数组，数组的第一个值代表该 locale 的 name，会用于拼接路由前缀和检测文件名属于什么 locale，第二个值代表该 locale 的 label，会用作语言切换时的选项显示。

默认 locale 的文件名后缀是可选的，比如，在默认配置下，`index.md` 和 `index.en-US.md` 等价。

## menus

- 类型：
- 默认值：
- 详细：

## navs

- 类型：
- 默认值：
- 详细：

## resolve.includes

- 类型：`Array<String>`
- 默认值：`['docs', 'src', 'packages/pkg/src']`
- 详细：

配置 dumi 嗅探的文档目录，dumi 会尝试在配置的目录中递归寻找 markdown 文件，默认值为 `docs` 目录、`src` 目录（普通项目）、`packages/pkg/src` 目录（lerna 项目），通常不需要配置，除非自动嗅探出现了『误伤』。

## resolve.previewLangs

- 类型：`Array<String>`
- 默认值：`['jsx', 'tsx']`
- 详细：

配置 dumi 默认会转换为 ReactComponent 组件渲染的代码块，如果不希望做任何转换，例如类似 Umi 官网的纯站点，那么将该项设置为空数组即可。

## routes

- 类型：`Array`
- 默认值：`null`
- 详细：

配置式路由，配置方式与 Umi 一致，可通过 `meta` 属性传递支持的 [frontmatter](/config/frontmatter) 属性。

## 其他配置

详见 Umi 的 [官方文档](https://umijs.org/config)。
