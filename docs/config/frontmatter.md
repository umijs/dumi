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

控制侧边栏菜单的显示或隐藏，通常用于展示全屏 Demo 的场景。

### order

- 类型：`Number`
- 默认值：`null`
- 详细：

控制该文档的显示顺序，数值越大排序越靠前。

### group

- 类型：`Object`
- 默认值：`null`
- 详细：

该配置用于对当前页面进行分组，这样可以在侧边栏菜单进行分组显示，该值有 3 项子配置：

#### group.title

- 类型：`String`
- 详细：

用于配置侧边栏菜单中该组别的菜单项名称。

#### group.path

- 类型：`String`
- 详细：

配置该组别的路由前缀，当 `location.pathname` 匹配到该前缀时，菜单组会进行 active 标记。

#### group.order

- 类型：`Number`
- 默认值：`null`
- 详细：

控制该文档组的显示顺序，数值越大排序越靠前。

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
