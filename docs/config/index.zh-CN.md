---
title: 配置项
order: 1
toc: menu
nav:
  title: 配置项
  order: 3
---

# 配置项

在项目根目录创建 `.umirc.ts` 或 `config/config.ts` 文件，都可对 dumi 进行配置：

```ts
// 配置文件
export default {
  // 具体配置项
};
```

目前 dumi 支持以下配置项。

## 基础配置

### algolia

- 类型: `Object`
- 默认值：`null`
- 详细：

配置 Algolia 的 [DocSearch](https://docsearch.algolia.com/) 服务，通常你会需要启用 sitemap.xml 的自动生成，以便顺利接入 Algolia，参考 [配置项 - sitemap](#sitemap)。

示例：

```js
{
  algolia: {
    apiKey: 'yourapikey',
    indexName: 'dumi',
  }
}
```

如果你的网站不符合 DocSearch [免费标准](https://docsearch.algolia.com/docs/who-can-apply)，可以自行注册 Algolia 账号并[部署爬虫](https://docsearch.algolia.com/docs/run-your-own)。这种情况下需要提供 `appId`。

```js
{
  algolia: {
    appId: 'yourappid',
    apiKey: 'yourapikey',
    indexName: 'dumi',
  }
}
```

### apiParser

- 类型：`Object`
- 默认值：`{}`
- 详细：

配置 API 解析的行为，支持以下配置项：

```js
{
  apiParser: {
    // 自定义属性过滤配置，也可以是一个函数，用法参考：https://github.com/styleguidist/react-docgen-typescript/#propfilter
    propFilter: {
      // 是否忽略从 node_modules 继承的属性，默认值为 false
      skipNodeModules: false,
      // 需要忽略的属性名列表，默认为空数组
      skipPropsWithName: ['title'],
      // 是否忽略没有文档说明的属性，默认值为 false
      skipPropsWithoutDoc: false,
    },
  }
}
```

### description

- 类型：`String`
- 默认值：`null`
- 详细：

配置文档的介绍，会显示在侧边栏菜单标题的下方，仅 `doc` 模式下可用。

### logo

- 类型：`String`
- 默认值：Umi 的 LOGO
- 详细：

配置文档的 LOGO。

> 如果是使用本地图片，比如：`/public/images/xxx.png`，那么配置 `/images/xx.png` 引入即可。

### locales

- 类型：`Array<[String, String]>`
- 默认值：`[['en-US', 'English'], ['zh-CN', '中文']]`
- 详细：

该配置为二维数组，第一项配置会作为站点默认的 locale。

每一项配置是一个长度为 2 的数组，数组的第一个值代表该 locale 的 name，会用于拼接路由前缀和检测文件名属于什么 locale，第二个值代表该 locale 的 label，会用作语言切换时的选项显示。

默认 locale 的文件名后缀是可选的，比如，在默认配置下，`index.md` 和 `index.en-US.md` 等价。

### mode

- 类型：`doc | site`
- 默认值：`doc`
- 详细：

用于设定文档的展现模式，默认为文档模式，配置为 `site` 时可无缝切换为站点模式。如果希望对导航菜单项展示的文本和顺序，可参考 frontmatter 配置中的 `nav` 配置项。

两种模式的效果如下，文档模式：

![](https://gw.alipayobjects.com/zos/bmw-prod/86ddc125-75e0-49e0-920b-f9497e806cf1/k7iyfr0t_w2600_h1754.png)

站点模式：

![](https://gw.alipayobjects.com/zos/bmw-prod/7ce6770d-df19-48fa-853e-64cbbf41b762/k7iyfarw_w2600_h1754.png)

### menus

- 类型：`Object`
- 默认值：`自动生成的菜单`
- 详细：

该配置项用于自定义侧边菜单的展示，目前仅 `site` 模式下可用，分多语言模式和单语言模式，使用方式：

```ts
// config/config.ts 或 .umirc.ts
export default {
  menus: {
    // 需要自定义侧边菜单的路径，没有配置的路径还是会使用自动生成的配置
    '/guide': [
      {
        title: '菜单项',
        path: '菜单路由（可选）',
        children: [
          // 菜单子项（可选）
          'guide/index.md', // 对应的 Markdown 文件，路径是相对于 resolve.includes 目录识别的
        ],
      },
    ],
    // 如果该路径有其他语言，需在前面加上语言前缀，需与 locales 配置中的路径一致
    '/zh-CN/guide': [
      // 省略，配置同上
    ],
  },
};
```

### navs

- 类型：`Object | Array`
- 默认值：`自动生成的导航`
- 详细：

该配置项用于自定义导航栏的展示，仅 `site` 模式下可用，分多语言模式和单语言模式，使用方式：

```ts
// config/config.ts 或 .umirc.ts
export default {
  // 单语言配置方式如下
  navs: [
    null, // null 值代表保留约定式生成的导航，只做增量配置
    {
      title: 'GitHub',
      path: 'https://github.com/umijs/dumi',
    },
    {
      title: '我有二级导航',
      path: '链接是可选的',
      // 可通过如下形式嵌套二级导航菜单，目前暂不支持更多层级嵌套：
      children: [
        { title: '第一项', path: 'https://d.umijs.org' },
        { title: '第二项', path: '/guide' },
      ],
    },
  ],

  // 多语言配置方式如下
  navs: {
    // 多语言 key 值需与 locales 配置中的 key 一致
    'en-US': [
      null, // null 值代表保留约定式生成的导航，只做增量配置
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
    'zh-CN': [
      null, // null 值代表保留约定式生成的导航，只做增量配置
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
  },
};
```

### resolve

`resolve` 是一个 `Object` 类型，用于配置 dumi 的解析行为，包含如下配置：

#### resolve.includes

- 类型：`Array<String>`
- 默认值：`['docs', 'src']` or `['docs', 'packages/pkg/src']`
- 详细：

配置 dumi 嗅探的文档目录，dumi 会尝试在配置的目录中递归寻找 markdown 文件，默认值为 `docs` 目录、`src` 目录（普通项目），如果环境为 lerna 项目，则 `src` 目录变为 `packages/pkg/src` 目录，通常不需要配置，除非自动嗅探出现了『误伤』。

#### resolve.excludes

- 类型：`Array<String>`
- 默认值：`[]`
- 详细：

需要排除的目录，会对 `dumi` 嗅探到的目录或文件进行过滤，规则同 `gitignore` 配置。

#### resolve.previewLangs

- 类型：`Array<String>`
- 默认值：`['jsx', 'tsx']`
- 详细：

配置 dumi 默认会转换为 ReactComponent 组件渲染的代码块，如果不希望做任何转换，例如类似 Umi 官网的纯站点，那么将该项设置为空数组即可。

#### resolve.passivePreview

- 类型：`Boolean`
- 默认值：`false`
- 详细：

代码块被动渲染模式，当为 true 时，仅将属于 `resolve.previewLangs` 且具有 `preview` 修饰符的代码块渲染为 ReactComponent 代码块。一般用于仅希望渲染 `resolve.previewLangs` 中的少部分代码块，而不是全部。

### sitemap

- Type: `{ hostname: string, excludes?: string[] }`
- Default: `null`

启用 `sitemap.xml` 自动生成特性。`hostname` 配置项用来指定 URL 的域名前缀，`excludes` 配置项用来忽略某些不需要包含在 sitemap 中的路由。

### title

- 类型：`String`
- 默认值：`{package.name}`
- 详细：

配置文档的名称，导航栏或侧边栏上。

### themeConfig

- 类型：`Object`
- 默认值：`{}`
- 详细：

用于配置当前使用的主题包，具体配置项取决于主题包提供哪些配置，可访问 [主题列表](/zh-CN/theme) 查看目前可用的主题。

## 更多配置

<!-- 以下是 Umi 配置项，由 scripts/sync-from-umi.js 从 Umi 仓库同步及过滤 -->

<embed src="../.upstream/config.md"></embed>
