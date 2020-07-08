---
title: FrontMatter
toc: menu
---

# FrontMatter

和大多数文档工具一样，为了使 Markdown 文件能发挥出配置能力，dumi 也不能免俗地提供了一些 FrontMatter 的配置；有些特殊的是，dumi 不仅支持 Markdown 文件进行 FrontMatter 配置，也支持外部 Demo 引入的 TSX/JSX 文件的 FrontMatter 配置。

Markdown 文件的 FrontMatter 编写方法如下：

<pre>---
title: 标题内容
---
</pre>

TSX/JSX 文件的 FrontMatter 编写方法如下：

<pre>
/**
&nbsp;* title: 标题内容
&nbsp;*/
</pre>

## Markdown 支持的 FrontMatter 配置项

### title

- 类型：`String`
- 默认值：`null`
- 详细：

用于配置该页面的标题，将会被用作该页面标题的子标题以及左侧菜单。

如果用户不进行配置，网站标题将会仅显示主标题；左侧菜单项名称默认为该 Markdown 文件的文件名（不含后缀）。

### sidemenu

- 类型：`Boolean`
- 默认值：`true`
- 详细：

控制侧边栏菜单的显示或隐藏。

### toc

- 类型：`false | 'content' | 'menu'`
- 默认值：`'content'`
- 详细：

控制锚点目录的显示或位置，值为 `false` 时不展示，值为 `content` 时展示在内容区域的右侧（Affix Menu），值为 `menu` 时会将**当前路由的锚点目录**展示在左侧菜单中。

### order

- 类型：`Number`
- 默认值：`null`
- 详细：

控制该文档的显示顺序，数值越小排序越靠前。

### legacy

- 类型：`String`
- 默认值：`null`
- 详细：

指定该文档的旧路径（从根路径开始指定），避免从其他文档迁移到 dumi 后原路径访问 `404`。

### group

- 类型：`Object`
- 默认值：`null`
- 详细：

该配置用于对当前页面进行分组，这样可以在侧边栏菜单进行分组显示，我们可以通过下方三项 FrontMatter 配置项显示地对 `group` 进行配置，也可以基于 dumi 的文件夹嵌套来自动生成 group，例如：

```
.
└── src/
    ├── components/
        ├── index.md
        ├── a.md
        ├── b.md
```

dumi 会自动为 `index.md`、`a.md`、`b.md` 指定 `group.title` 为 `Components`、`group.path` 为 `/components`。并且我们可以通过 FrontMatter 对生成的默认配置进行**选择性复写**，比如：

```yaml
---
group:
  title: 组件
---

```

则最终生成的 `group.path` 还是 `/components`，但 `group.title` 则变成了 `组件`。

#### group.title

- 类型：`String`
- 详细：

用于配置侧边栏菜单中该组别的菜单项名称，如果未配置则会默认读取 `group.path` 并转换为 `title`，例如将 `/components` 转换为 `Components`。

#### group.path

- 类型：`String`
- 详细：

**必选**，配置该组别的路由前缀，当 `location.pathname` 匹配到该前缀时，菜单组会进行 active 标记。

#### group.order

- 类型：`Number`
- 默认值：`null`
- 详细：

控制该文档组的显示顺序，数值越小排序越靠前。

### nav

- 类型：`Object`
- 默认值：`null`
- 详细：

**仅 site 模式下可用**，该配置用于手动指定当前文档所处的导航菜单，默认根据第一级路由路径自动生成，子配置项与 `group` 一致。

#### nav.title

略，与 `group.title` 一致。

#### nav.path

略，与 `group.path` 一致。

#### nav.order

略，与 `group.order` 一致。

### hero

- 类型：`Object`
- 默认值：`null`
- 详细：

在 site 模式下可用，配置 hero 后，该页面将会以首页形式呈现。

#### hero.title

- 类型：`String`
- 默认值：`null`
- 详细：

配置首页首屏区域的大标题。

#### hero.desc

- 类型：`String`
- 默认值：`null`
- 详细：

配置首页首屏区域的简介文字。

#### hero.actions

- 类型：`Array`
- 默认值：`null`
- 详细：

配置首页首屏区域的操作按钮，第一个按钮会作为主按钮展示，配置格式如下：

```yaml
hero:
  actions:
    - text: Getting Started
      link: /getting-started
```

### features

- 类型：`Object`
- 默认值：`null`
- 详细：

在 site 模式下可用，配置后该页面将会以首页形式呈现，用于每行 3 个的形式展示组件库的特性，配置格式如下：

```yaml
features:
  - icon: 图标的 URL 地址，建议切图尺寸为 144 * 144（可选）
    title: 性能强大
    desc: 可以配置 `markdown` 文本
```

### footer

- 类型：`Markdown`
- 默认值：`null`
- 详细：

配置当前页面的 footer 区域，建议首页做配置即可，目前暂不支持统一对所有页面进行配置。

### translateHelp

- 类型：`Boolean`
- 默认值：`false`
- 详细：

是否在该页面顶部展示『帮助翻译』的提示框。

## TSX/JSX 支持的 FrontMatter 配置项

### title

- 类型：`String`
- 默认值：`null`
- 详细：

用于配置该外部 Demo 的标题，配置后会在 Demo 预览器中显示。

### desc

- 类型：`Markdown`
- 默认值：`null`
- 详细：

用于配置该外部 Demo 的简介，配置后会在 Demo 预览器中显示，支持 Markdown 语法。

### inline

- 类型：`Boolean`
- 默认值：`false`
- 详细：

用于指示该 demo 为自由 demo，将会直接在文档中嵌入渲染，不会被 demo 容器包裹，用户也无法查看源代码。

### transform

- 类型：`Boolean`
- 默认值：`false`
- 详细：

用于控制 demo 的包裹容器是否设置 `transform` 的 CSS 值以控制 `position: fixed;` 的元素相对于 demo 容器定位。

### defaultShowCode

- 类型：`Boolean`
- 默认值：`false`
- 详细：

用于控制当前 demo 的包裹容器是否默认展开源代码显示。

### hideActions

- 类型：`Array<'CSB' | 'EXTERNAL'>`
- 默认值：`[]`
- 详细：

用于控制 Demo 预览器部分功能按钮的隐藏，配置值含义如下：

- CSB: 隐藏『在 codesandbox.io 中打开』的按钮
- EXTERNAL: 隐藏『在新窗口打开』的按钮

通过 code 标签的属性配置：

```html
<!-- 注意，单引号为必备，要确保值为有效 JSON 字符串 -->
<code hideActions='["CSB"]' />
```

通过 frontmatter 配置：

```ts
/**
 * hideActions: ["CSB"]
 * hideActions:
 *   - CSB
 */

// 以上两种方式均可识别
```

### 通过 `code` 标签控制

所有 TSX/JSX 支持的配置项，在使用 `code` 标签引入外部 demo 时也可以使用，就像这样：

```html
<code title="标题" desc="说明文字" src="/path/to/demo" />
```
