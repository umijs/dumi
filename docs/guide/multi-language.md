---
title: 多语言支持
---

# 多语言支持

通常我们的组件文档都会编写不止一种语言，以覆盖不同国家、地区开发者的需要。基于 dumi，仅需给 `.md` 添加 locale 后缀，即可为你的文档启用多语言切换功能。

## 最小示例

如果我们的文件目录结构是这样：

```
.
└── src/
    ├── index.en-US.md # 如果 en-US 为默认 locale，则 index.md 和 index.en-US.md 等价
    ├── index.zh-CN.md
```

那么在默认配置下，生成的路由表将会变成这样：

```js
[
  {
    path: '/',
    // ...
  },
  {
    path: '/zh-CN',
    // ...
  },
];
```

左侧菜单的将会随着 locale 的切换而变化：

```jsx | inline
import React from 'react';
import gif from '../assets/locale-menu.gif';

export default () => <img src={gif} width="250" />;
```

此时我们的最小多语言示例就完成了。

## 默认语言和翻译缺失

在 dumi 的默认配置中，`en-US` 是默认语言，`zh-CN` 是第二种语言，如果你需要修改这个配置，比如修改默认语言、或者添加更多语言，请查看 <a href="/config?#locales">Config - locales</a> 配置项。

在实际的文档编写过程中，我们很可能是**增量**、**渐进式**进行的，例如先把默认语言的所有文档写好，然后增量翻译为其他语言，这势必会存在一个『文档翻译到一半』的过渡期。

为了让这个过渡期更加平滑和友好，**dumi 会将默认语言作为未翻译语言的兜底文档**，理解起来可能有些许困难，让我们看一个案例。

假设目录结构如下：

```
.
└── src/
    ├── missing/
    |   ├── index.md
    ├── index.md
    ├── index.zh-CN.md
```

很显然我们 `missing` 这篇文档的中文翻译是缺失的，也就是说 `/zh-CN/missing` 的内容是不存在的，此时 dumi 会自动将 `/zh-CN/missing` 的内容渲染为默认语言的内容，即 `/missing` 路由的内容，以确保文档是可访问的。

后续会计划添加翻译缺失的提示，引导浏览者为文档贡献翻译。

## 其他约定

### 默认 locale 文件后缀可选

如果某个 `.md` 文件没有 locale 后缀，那么它会被 dumi 识别为默认 locale。例如默认 locale 为 `en-US`，那么 `abc.md` 则会被 dumi 当作 `abc.en-US.md`。

### locale 的有效性

如果 locale 配置为 `en-US`（默认）和 `zh-CN`，但 dumi 没能在任意 `.md` 文件中找到 `zh-CN` 后缀，则此时 `zh-CN` 的 locale 会被 dumi 认定为无效 locale，不会在站点中呈现给用户。

### `README.md` 的多语言

如果一个站点没有根路由（即任意 `include` 根目录下都没有 `index.md` or `README.md`），dumi 会将项目根目录的 `README.md` 作为根路由渲染；如果同时启用了多语言，那么会尝试去寻找 `README.{locale}.md`，如果找不到，则会 fallback 到 `README.md`。
