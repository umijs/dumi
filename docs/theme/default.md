---
group: 介绍
---

# 默认主题

dumi 内置了一套完善的默认主题，默认主题的呈现效果与 dumi 官网一致。

[默认主题源码中](https://github.com/umijs/dumi/tree/master/src/client/theme-default) 的 `builtins`、`slots` 和 `layouts` 是可以通过本地主题局部覆盖、实现定制化的，具体可参考 [主题 - 如何工作](/theme) 了解更多。

## 站点配置

默认主题提供了如下站点配置项，均在 `.dumirc.ts` 中的 `themeConfig` 配置项中配置。

<!-- site config -->

### editLink <Badge>2.2.2+</Badge>

- 类型：`boolean | string`
- 默认值：`true`

配置是否在 Markdown 页面内容区域底部展示当前文档的编辑链接。

当配置为 `true` 时 dumi 会根据项目 `package.json` 中的 `repository` 配置及当前分支，使用 [hosted-git-info](https://github.com/npm/hosted-git-info) 自动生成编辑链接，仅支持[部分代码托管平台](https://github.com/npm/hosted-git-info#supported-hosts)；如果你使用的是其他代码托管平台或私有化部署的平台，可以使用字符串模板自定义编辑链接，例如 `https://gitlab.example.com/group/repo/{filename}`，其中 `{filename}` 会被替换为当前文档在仓库中的文件路径。

### lastUpdated <Badge>2.2.2+</Badge>

- 类型：`boolean`
- 默认值：`true`

配置是否在 Markdown 页面内容区域底部展示当前文档的最后更新时间。

文档最后更新时间来源于 Git 提交记录，如果 Markdown 文档还未被 Git 追踪，那么则会展示构建时间；如果你的文档通过 GitHub Action 进行部署，还需要在 [actions/checkout](https://github.com/actions/checkout) 步骤中加上 `fetch-depth: 0` 参数以检出所有 Git 提交记录，确保可以 dumi 可以拿到正确的最后更新时间，具体可参考 [FAQ - 自动部署](../guide/faq.md#自动部署)。

### logo

- 类型：`string | false`
- 默认值：`dumi 的 LOGO`

配置导航栏上的站点 LOGO，如果需要配置为本地图片文件，可将图片资源放入 `public` 文件夹，例如放置 `public/logo.png`，则配置 `/logo.png` 即可。

配置为 `false` 时不展示 LOGO。

### name

- 类型：`string`
- 默认值：`undefined`

配置导航栏上的站点名称，不配置时不展示。

### nav

- `Navs`类型：`{ title: '导航标题', link: '导航路由', activePath: '高亮路径' }[] | Record<string, { title: '导航标题', link: '导航路由', activePath: '高亮路径' }[]>`
- 类型：`Navs | {mode: "override" | "append" | "prepend", value: Navs}`
- 默认值：`约定式导航`

配置导航栏上的导航项，不配置时默认为约定式导航。约定式导航生成规则可参考 [约定式路由](/guide/conventional-routing)。

```ts
{
  // 单语言时配置数组即可
  nav: [{ title: 'Blog', link: '/blog' }],

  // 多语言时配置对象，key 为语言名
  nav: {
    'zh-CN': [{ title: '博客', link: '/blog' }],
    'en-US': [{ title: 'Blog', link: '/en/blog' }],
  },

  // 支持通过 nav 将路由追加到约定路由前面或后面
  nav: {
    // mode可选值有：override、append、prepend
    // - override: 直接覆盖约定导航，与 nav: [{ title: 'Blog', link: '/blog' }] 配置相同
    // - append: 将 value 中的导航追加到约定路由后面
    // - prepend: 将 value 中的导航添加到约定路由前面
    mode: "append",
    value: [{ title: 'Blog', link: '/blog' }]
  }
}
```

### sidebar

- 类型：`Record<'/nav_path', { title: '分组名称（可选）', children: { title: '菜单项', link: '菜单路由' }[] }[]>`
- 默认值：`约定式侧边菜单`

配置侧边栏菜单，`key` 为导航路由，配置后对该导航下的所有一级子页面生效，例如 `{ '/guide': [] }` 只对 `/guide` 及 `/guide/xxx` 生效。

不配置时默认为约定式侧边菜单，约定式侧边菜单生成规则可参考 [约定式路由](/guide/conventional-routing)。

### footer

- 类型：`string | false`
- 默认值：`Powered by dumi`

配置页脚内容，可以是 HTML，配置 `false` 时不展示。

### rtl

- 类型：`boolean`
- 默认值：`false`

是否开启 RTL 切换，配置为 `true` 时导航栏会展示 RTL 按钮，用于将站点文本阅读方向切换为『从右到左』，通常在站点用户群体中有使用希伯来语或阿拉伯语时启用。

### showLineNum <Badge>2.2.0+</Badge>

- 类型：`boolean`
- 默认值：`false`

是否在代码块中展示行号，配置为 `true` 时会展示代码行号。

<h3>
nprogress
<span style="display: none">-</span>
<Badge>2.1.23+</Badge>
</h3>

- 类型：`boolean`
- 默认值：`true`

切换页面时是否在页面顶部展示进度条，效果如 [nprogress](https://github.com/rstacruz/nprogress)。

### prefersColor

- 类型：`{ default: 'light' | 'dark' | 'auto'; switch: boolean }`
- 默认值：`{ default: 'light', switch: true }`

配置站点的主题色，其中 `default` 配置项为默认主题色，默认为亮色模式，配置为 `auto` 时将跟随用户的操作系统配置自动切换；`switch` 配置项控制主题色切换器的展示与否，配置为 `false` 时用户将无法主动切换站点主题色。

对于普通文档站点来说，建议保持 `switch` 的默认值 `true`，将站点主题色的选择权交给用户，同时可以考虑将 `default` 设置为 `auto` 以跟随用户的系统配置：

```ts
export default {
  themeConfig: {
    prefersColor: { default: 'auto' },
  },
};
```

对于组件库文档站点来说，建议根据组件库对暗色模式的适配情况来选择是否配置 `switch` 为 `false`，避免用户切换主题色后组件 demo 的样式出现异常。

:::warning
请勿在组件源码或组件 demo 内使用 dumi 提供的 API 强行适配暗色模式，这将导致组件发布后工作异常，因为 dumi 的 API 仅在 dumi 的框架中可用！

正确做法是和 antd 一样提供类似 `ConfigProvider` 的全局配置组件来控制组件的主题色，再使用 `usePrefersColor` API 在 `GlobalLayout` 中实现站点主题色和组件主题色的切换联动，具体可参考 `usePrefersColor` API 的 [使用示例](../theme/api.md#usepreferscolor)。
:::

对于主题开发者来说，可以在 Less 文件中使用 `@dark-selector` 的全局变量来为主题包的组件增加暗色模式的样式：

```less
.some-container {
  // 亮色模式为白色
  color: #fff;

  // 暗色模式变黑色
  @{dark-selector} & {
    color: #000;
  }
}
```

### socialLinks

如果想要在顶部导航栏右侧增加一些社交网站的外链图标，可以通过 `socialLinks` 进行配置，目前最多支持配置 **5** 个外链图标

目前支持以下社交平台图标：

|   Key    |     描述      |
| :------: | :-----------: |
|  github  |  GitHub 平台  |
|  weibo   |   微博平台    |
| twitter  | Twitter 平台  |
|  gitlab  |  Gitlab 平台  |
| facebook | Facebook 平台 |
|  zhihu   |   知乎平台    |
|  yuque   |   语雀平台    |
| linkedin | Linkedin 平台 |

```ts
export default {
  themeConfig: {
    socialLinks: {
      github: 'https://github.com/umijs/dumi',
      weibo: 'https://xxxx',
      twitter: 'https://xxxx',
      gitlab: 'https://xxxx',
      facebook: 'https://xxxx',
      zhihu: 'https://xxxx',
      yuque: 'https://xxxx',
      linkedin: 'https://xxxx',
    },
  },
};
```

<!-- site config end -->

## Markdown 配置

默认主题提供了如下 Markdown 配置项，用于首页展示。

<!-- md config -->

### features

- 类型：`Object`
- 默认值：`null`
- 详细：

配置后该页面将会以首页形式呈现，用于每行 3 个的形式展示组件库的特性，配置格式如下：

```yaml
features:
  - emoji: 🚀
    title: 性能强大
    link: 可为标题配置超链接
    description: 可以配置 HTML 文本
```

### hero

- 类型：`Object`
- 默认值：`null`
- 详细：

配置 hero 后，该页面将会以首页形式呈现。

#### title

- 类型：`String`
- 默认值：`null`
- 详细：

配置首页首屏区域的大标题。

#### description

- 类型：`String`
- 默认值：`null`
- 详细：

配置首页首屏区域的简介文字，可以是 HTML 文本。

#### actions

- 类型：`Array`
- 默认值：`null`
- 详细：

配置首页首屏区域的操作按钮，最后一个按钮会作为主按钮展示，配置格式如下：

```yaml
hero:
  actions:
    - text: Getting Started
      link: /getting-started
```

### sidebar

- 类型：`Boolean`
- 默认值：`true`
- 详细：

控制侧边栏菜单的显示或隐藏。

<!-- md config end -->
