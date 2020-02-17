---
title: FrontMatter
group:
  title: 配置项
---

# FrontMatter

和大多数文档工具一样，为了使 Markdown 文件能发挥出配置能力，father-doc 也不能免俗地提供了一些 FrontMatter 的配置；值得一提的是，father-doc 不仅支持 Markdown 文件进行 FrontMatter 配置，也支持外部 Demo 引入的 TSX/JSX 文件的 FrontMatter 配置。

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

### sidebar

- 类型：`Boolean`
- 默认值：`true`
- 详细：

控制侧边栏菜单的显示或隐藏。

### slugs

- 类型：`Boolean`
- 默认值：`true`
- 详细：

控制右侧 affix menu 的显示或隐藏。

### order

- 类型：`Number`
- 默认值：`null`
- 详细：

控制该文档的显示顺序，数值越大排序越靠前。

### legacy

- 类型：`String`
- 默认值：`null`
- 详细：

指定该文档的旧路径（从根路径开始指定），避免从其他文档迁移到 father-doc 后原路径访问 `404`。

### group

- 类型：`Object`
- 默认值：`null`
- 详细：

该配置用于对当前页面进行分组，这样可以在侧边栏菜单进行分组显示，我们可以通过下方三项 FrontMatter 配置项显示地对 `group` 进行配置，也可以基于 father-doc 的文件夹嵌套来自动生成 group，例如：

```
.
└── src/
    ├── components/
        ├── index.md
        ├── a.md
        ├── b.md
```

father-doc 会自动为 `index.md`、`a.md`、`b.md` 指定 `group.title` 为 `Components`、`group.path` 为 `/components`。并且我们可以通过 FrontMatter 对生成的默认配置进行**选择性复写**，比如：

```md
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

控制该文档组的显示顺序，数值越大排序越靠前。

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

## TSX/JSX 支持的 FrontMatter 配置项

### title

- 类型：`String`
- 默认值：`null`
- 详细：

用于配置该外部 Demo 的标题，配置后会在 Demo 预览器中显示。

### desc

- 类型：`String`
- 默认值：`null`
- 详细：

用于配置该外部 Demo 的简介，配置后会在 Demo 预览器中显示。

### inline

- 类型：`Boolean`
- 默认值：`false`
- 详细：

用于指示该 demo 为自由 demo，可参照 [好好写 demo - 自由 demo](#/write-demo?anchor=自由-demo)。
