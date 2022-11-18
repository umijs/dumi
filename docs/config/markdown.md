---
toc: content
---

# Markdown 配置

所有 Markdown 配置均以 FrontMatter 的形式配置在 Markdown 文件顶端，例如：

```md
---
title: 配置页面标题
---

其他 Markdown 内容
```

目前 dumi 支持以下 Markdown 配置。

## demo

该配置项控制 demo 的展示方式，目前支持以下配置。

### cols

- 类型：`number`
- 默认值：`1`

配置 demo 分栏展示的列数，默认值为 1，建议不要超过 3，后续会增加响应式规则、在小屏幕设备下自动减小列数。

注意，仅用换行符分隔的 `code` 标签 demo 会参与分栏，例如：

```md
<!-- 以下 3 个 demo 参与分栏 -->

<code src="./demos/a.tsx">a</code>
<code src="./demos/b.tsx">b</code>
<code src="./demos/c.tsx">c</code>

<!-- 以下 3 个 demo 不参与分栏 -->

<code src="./demos/a.tsx">a</code>

<code src="./demos/b.tsx">b</code>

<code src="./demos/c.tsx">c</code>
```

如果有使用 Prettier，为了避免换行符被自动格式化成一行，请修改 `.prettierrc` 添加如下规则：

```diff
{
  ...,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "preserve"
      }
    }
  ]
}
```

### tocDepth

- 类型：`number`
- 默认值：`3`

配置 demo 标题的 toc 层级，默认值为 3。

## description

- 类型：`string`
- 默认值：`undefined`

配置页面简介，该值会用于生成 `<meta>` 标签。

## group

- 类型：`string | { title: string; order: number }`
- 默认值：`undefined`

配置当前页所属的侧边菜单分组，未配置时不会展示分组。

如果需要控制分组顺序，同一分组下仅需配置任意一个 Markdown 文件即可全局生效，例如：

<pre><code className="language-md">
// parent/a.md
---
group: A
---
</code></pre>

<pre><code className="language-md">
// parent/b.md
---
group:
  title: A
  order: 1 # 这个 order 配置会被自动应用在 a.md 中
---
</code></pre>

## keywords

- 类型：`string[]`
- 默认值：`undefined`

配置页面关键词，该值会用于生成 `<meta>` 标签。

## order

- 类型：`number`
- 默认值：`undefined`

配置当前页面在侧边菜单中的排序，未配置时按照文件名排序。

## title

- 类型：`string`
- 默认值：`自动识别`

配置页面标题，该值会用于 `<title>` 标签、侧边菜单项展示，默认值为该文档的一级标题，如果不存在则使用 Markdown 文件名作为默认值。

## 默认主题配置项

:::warning
当切换主题包后，默认主题的配置项能否工作将取决于新主题是否支持，请以主题包的文档为准
:::

除了框架提供的基础 Markdown 配置项以外，dumi 的默认主题还提供了如下 Markdown 配置项：

<embed src="../theme/default.md#RE-/<!-- md config[^]+ md config end -->/"></embed>
