---
group: 介绍
---

# 默认主题

dumi 内置了一套完善的默认主题，默认主题的呈现效果与 dumi 官网一致。

[默认主题源码中](https://github.com/umijs/dumi/tree/master/src/client/theme-default) 的 `builtins`、`slots` 和 `layouts` 是可以通过本地主题局部覆盖、实现定制化的，具体可参考 [主题 - 如何工作](/theme) 了解更多。

## 站点配置

默认主题提供了如下站点配置项，均在 `.dumirc.ts` 中的 `themeConfig` 配置项中配置。

<!-- site config -->

### name

- 类型：`string`
- 默认值：`undefined`

配置导航栏上的站点名称，不配置时不展示。

### logo

- 类型：`string`
- 默认值：`dumi 的 LOGO`

配置导航栏上的站点 LOGO，如果需要配置为本地图片文件，可将图片资源放入 `public` 文件夹，例如放置 `public/logo.png`，则配置 `/logo.png` 即可。

### nav

- 类型：`{ title: '导航标题', link: '导航路由' }[]`
- 默认值：`约定式导航`

配置导航栏上的导航项，不配置时默认为约定式导航。约定式导航生成规则可参考 [约定式路由](/guide/conventional-routing)。

### sidebar

- 类型：`Record<'/path', { title: '分组名称（可选）', children: { title: '菜单项', link: '菜单路由' }[] }[]>`
- 默认值：`约定式侧边菜单`

配置侧边栏菜单，不配置时默认为约定式侧边菜单。约定式侧边菜单生成规则可参考 [约定式路由](/guide/conventional-routing)。

### footer

- 类型：`string | false`
- 默认值：`Powered by dumi`

配置页脚内容，可以是 HTML，配置 `false` 时不展示。

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

<!-- md config end -->
