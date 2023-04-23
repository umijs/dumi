---
nav: 指南
group: 基础
order: 4
mobile: false
demo:
  cols: 2
  tocDepth: 4
---

# 页面渲染配置

dumi 提供了一系列 FrontMatter 属性，以满足不同的页面渲染需求

## tdk 配置

如果希望配置页面级 tdk ,只需如下编写 FrontMatter , dumi 会在 `<head>` 标签内插入对应的 `<title>` 和 `<meta>` 标签

```md
---
title: 标题 # 配置页面标题,同时生成 <title> 标签
description: 描述 # 配置页面简介，同时用于生成 <meta> 标签
keywords: [关键词] # 配置页面关键词，同时用于生成 <meta> 标签
---

<!-- 其他 Markdown 内容 -->
```

## 首页配置

dumi 为我们提供了 `hero` 和 `features` 的 FrontMatter 属性，让我们能够快速搭建一个组件库首页。主要为首页首屏和组件库特性两部分。

```md
---
hero:
  title: dumi
  description: 企业级前端开发框架
  actions:
    - text: 快速上手
      link: /hello
    - text: GitHub
      link: /hello
features:
  - title: 非常快
    emoji: 🚀
    description: 考究的默认配置和约定式的目录结构，帮助开发者零成本上手，让所有注意力都能放在文档编写和组件开发上
---

<!-- 其他 Markdown 内容 -->
```

## 锚点目录配置

锚点目录默认显示在左侧菜单中，我们可以通过配置其值为 `content`,将其显示在内容区域右侧，也可设置为 boolean 值，使其不进行展示

```md
---
toc: content
---

<!-- 其他 Markdown 内容 -->
```

## demo 分栏配置

dumi 支持对不同页面，灵活定制 demo 的分栏布局

```md
---
demo:
  cols: 2
---

<!-- 其他 Markdown 内容 -->
```

配置 `demo.cols` 后,以下多个 demo 完将会被渲染为双栏布局：

```md
<code src="./demos/cols.tsx">分栏 1</code>
<code src="./demos/cols.tsx">分栏 2</code>
<code src="./demos/cols.tsx">分栏 3</code>
<code src="./demos/cols.tsx">分栏 4</code>
```

<code id="foo" src="./demos/cols.tsx">分栏 1</code>
<code id="bar" src="./demos/cols.tsx">分栏 2</code>
<code id="baz" src="./demos/cols.tsx">分栏 3</code>
<code id="other" src="./demos/cols.tsx">分栏 4</code>
