---
group:
  title: 开始写组件 Demo
---

# 控制 Demo 渲染

Demo 的渲染是由 dumi 内置的 `Previewer` 控制的，该组件暴露了一些 `props`，我们可以通过 FrontMatter 来进行设置，例如：

<pre>
```jsx
/**
 * title: 标题内容
 */

// 组件内容
```
</pre>

dumi 会对源代码中的 FrontMatter 进行剔除，不会展示给用户。如果是引入的外部 Demo，我们除了可以直接在外部 Demo 的文件中像上面一样配置 FrontMatter 之外，还可以直接向 `code` 标签传递 `props`：

```html
<code src="/path/to/Demo.tsx" title="标题内容" />
```

目前，内置的 `Previewer` 组件为如下场景提供了控制配置项。

## `fixed` 定位元素

倘若我们的 Demo 包含 `position: fixed;` 的元素，那么它在渲染的时候必然会『飞出』Demo 包裹器；可有些场景下，我们仍然是希望它相对于 Demo 包裹器定位的，所以 `Previewer` 提供了 `transform` 的配置项，一旦设置为 true，则会为 Demo 包裹器加上 `transform` 用于更改 `position: fixed` 元素的 CSS 包含块 为 Demo 包裹器，就像这样：

<pre>
```jsx
/**
 * transform: true
 */

// 组件内容
```
</pre>

## 修改背景色

默认情况下 Demo 包裹器的背景色为白色，但有些 Demo 需要有深色的背景，通过 `background` 配置项，可以修改它的背景颜色、渐变甚至加上背景图片，`Previewer` 会将其当做 CSS 属性值处理：

<pre>
```jsx
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```
</pre>

效果如下：

```jsx
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```

## 不需要内边距

为了体现留白的艺术，Demo 包裹器默认有 `padding`，以确保 Demo 不会贴边展示；但有些 Demo 我们却是希望它贴边展示的，比如导航头、侧边栏等等。dumi 提供了 `compact` 配置项来控制内边距，一旦设置为 `true`，则会移除所有内边距：

<pre>
```jsx
/**
 * compact: true
 */

import React from 'react';

export default () => '我会贴边站';
```
</pre>

效果如下：

```jsx
/**
 * compact: true
 */

import React from 'react';

export default () => '我会贴边站';
```

## 标题与简介

如果我们希望为当前 Demo 加上描述信息，例如标题与简介，可以通过 `title` 和 `desc` 进行配置：

<pre>
```jsx
/**
 * title: 我是标题
 * desc: 我是简介，我可以用 `Markdown` 来编写
 */

import React from 'react';

export default () => null;
```
</pre>

效果如下：

```jsx
/**
 * title: 我是标题
 * desc: 我是简介，我可以用 `Markdown` 来编写
 */

import React from 'react';

export default () => null;
```

## 直接嵌入文档

将 Demo 以嵌入形式呈现，请参考 [Demo 的类型 - 嵌入式](/guide/demo-types#嵌入式)。
