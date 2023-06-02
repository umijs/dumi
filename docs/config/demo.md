---
group: 文档渲染配置
toc: content
---

# Demo 配置

Demo 的配置用于控制 demo 渲染。

对于代码块 demo 来说，仅有 FrontMatter 一种配置方式：

<pre>
```jsx
/**
 * title: demo 标题
 */
import React from 'react';

export default () => <>Hello world!</>;
```
</pre>

对于外部 demo 来说，除了可以和代码块 demo 一样通过 FrontMatter 配置外，还可以通过 `code` 标签属性进行配置：

```md
<!-- 通过 code 标签配置 -->

<code src="./demos/a.tsx" description="demo 描述">demo 标题</code>
```

目前 dumi 支持以下 demo 配置项。

## background

- 类型：`string`
- 默认值：`undefined`

用于设置 demo 渲染容器的背景色。

## compact

- 类型：`boolean`
- 默认值：`false`

以紧凑模式渲染 demo，开启时 demo 预览容器将不会有内边距。

## debug

- 类型：`boolean`
- 默认值：`false`

标记当前 demo 为调试 demo，这意味着在生产模式下该 demo 是不可见的；另外，调试 demo 在开发环境下也会展示一个 DEV ONLY 的标记，以便开发者将其和其他 demo 区分开来。

## defaultShowCode

- 类型：`boolean`
- 默认值：`false`

配置是否默认展开 demo 源代码。

## demoUrl

- 类型：`string`
- 默认值：`dumi 自动生成的 demo 独立访问链接`

用于指定该 demo 的访问链接，仅在 `iframe` 呈现模式下才会生效；通常在 dumi 默认渲染的 demo 无法满足展示需要时使用，例如需要呈现 ReactNative 的渲染结果。

## description

- 类型：`string`
- 默认值：`undefined`

配置 demo 的描述，会展示在 demo 预览器里，支持被搜索；需要注意的是，**仅在 demo 标题已配置时才会展示描述**。

## iframe

- 类型：`boolean` | `string` | `number`
- 默认值：`false`

使用 iframe 形式渲染 demo，通常用于 Layout 等需要与页面隔离的 demo。 如果参数设置为 `number` 或者 `string` 类型，最终会被渲染成为 iframe 的高度，注意 `string` 类型目前只能是可以转换为数字的值， 比如字符串 `100`。

## inline

- 类型：`boolean`
- 默认值：`false`

是否以内联模式渲染 demo，开启后 demo 将不会有预览容器。

## title

- 类型：`string`
- 默认值：`undefined`

配置 demo 的标题，会展示在 demo 预览器里，支持被搜索。

## transform

- 类型：`boolean`
- 默认值：`false`

开启时 demo 预览容器将会添加 `transform` 的 CSS 值，以控制 `position: fixed;` 的元素相对于 demo 容器定位。
