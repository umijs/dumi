---
order: 1
nav:
  order: 2
  title: 配置项
toc: menu
---

<Alert>
提示：dumi 基于 Umi，即除了本页提到的配置项以外，还支持 <a target="_blank" href="https://umijs.org/config">所有 Umi 的配置项</a>，并且也支持 <a target="_blank" href="https://umijs.org/plugins/preset-react">Umi 生态的插件</a>。
</Alert>

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

两种模式的效果可见 [指南 - 多种呈现模式](/guide/mode)。

## title

- 类型：`String`
- 默认值：`package.name`
- 详细：

配置文档的名称，通常是所开发的组件的名称。

## description

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
- 默认值：`[['en-US', 'English'], ['zh-CN', '中文']]`
- 详细：

该配置为二维数组，第一项配置会作为站点默认的 locale。

每一项配置是一个长度为 2 的数组，数组的第一个值代表该 locale 的 name，会用于拼接路由前缀和检测文件名属于什么 locale，第二个值代表该 locale 的 label，会用作语言切换时的选项显示。

默认 locale 的文件名后缀是可选的，比如，在默认配置下，`index.md` 和 `index.en-US.md` 等价。

## menus

- 类型：`Object`
- 默认值：`自动生成的菜单`
- 详细：

该配置项用于自定义侧边菜单的展示，目前仅 `site` 模式下可用，分多语言模式和单语言模式，使用方式详见 [指南 - 配置式侧边菜单](/guide/control-menu-generate#配置式侧边菜单)。

## theme

- 类型：`Object`
- 默认值：`默认主题`
- 详细：

主题颜色变量名称参照 [https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/themes/default/variables.less](https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/themes/default/variables.less)

```js
  theme: {
    '@c-primary': '#ff652f',
  }
```

## navs

- 类型：`Object | Array`
- 默认值：`自动生成的导航`
- 详细：

该配置项用于自定义导航栏的展示，仅 `site` 模式下可用，分多语言模式和单语言模式，使用方式详见 [指南 - 配置式导航菜单](/guide/control-nav-generate#配置式导航菜单)。

可通过如下形式嵌套二级导航菜单，目前暂不支持更多层级嵌套：

```js
export default {
  navs: [
    {
      title: '我有二级导航',
      path: '链接是可选的',
      children: [
        { title: '第一项', path: 'https://d.umijs.org' },
        { title: '第二项', path: '/guide' },
      ],
    },
  ],
};
```

## resolve

`resolve` 是一个 `Object` 类型，包含如下配置：

### includes

- 类型：`Array<String>`
- 默认值：`['docs', 'src', 'packages/pkg/src']`
- 详细：

配置 dumi 嗅探的文档目录，dumi 会尝试在配置的目录中递归寻找 markdown 文件，默认值为 `docs` 目录、`src` 目录（普通项目）、`packages/pkg/src` 目录（lerna 项目），通常不需要配置，除非自动嗅探出现了『误伤』。

### previewLangs

- 类型：`Array<String>`
- 默认值：`['jsx', 'tsx']`
- 详细：

配置 dumi 默认会转换为 ReactComponent 组件渲染的代码块，如果不希望做任何转换，例如类似 Umi 官网的纯站点，那么将该项设置为空数组即可。

## routes

- 类型：`Array`
- 默认值：`null`
- 详细：

配置式路由，配置方式与 Umi 一致，可通过 `meta` 属性传递支持的 [frontmatter](/config/frontmatter) 属性。

## algolia

- 类型: `Object`
- 默认值：`null`
- 详细：

配置 Algolia 的 [DocSearch](https://docsearch.algolia.com/) 服务。

示例：

```js
{
  algolia: {
    apiKey: 'yourapikey',
    indexName: 'dumi',
  }
}
```

## 其他配置

详见 Umi 的 [官方文档](https://umijs.org/config)。
