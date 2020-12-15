---
title: 介绍
order: 1
nav:
  title: 指南
  order: 1
---

## 什么是 dumi？

dumi，暂时就叫它**嘟米**吧，是一款基于 Umi 打造、为组件开发场景而生的文档工具，与 [father](https://github.com/umijs/father) 一起为开发者提供一站式的组件开发体验，**father 负责构建，而 dumi 负责组件开发及组件文档生成**。

和 Umi 类似，dumi 也是以路由为基础的，会自动根据目录结构和 FrontMatter 生成对应的文档导航、菜单和路由，同时也支持配置式路由以满足自定义需要；另外，为了便于开发组件和展示组件 demo，dumi 基于 remarkjs 打造了强大、贴心的 Markdown 编译器，使我们能非常方便地在 Markdown 中编写 demo、甚至往 Markdown 中导入 demo；加上 Umi 丰富的 preset、plugin 生态，能帮我们应对各种复杂场景。

<!-- dumi 的前身叫 father-doc -->

## 特性

- 📦 开箱即用，让所有注意力都放在文档编写和组件开发
- 🚀 基于 [Umi 3](https://umijs.org/zh-CN)，天生高性能、可扩展
- 📋 强大的 Markdown 扩展，可嵌入 Demo、可导入外部 Demo 甚至插入自定义 React 组件

## 参与贡献

欢迎加入到 dumi 的建设队伍中来，请访问 https://github.com/umijs/dumi 。

```jsx | inline
import React from 'react';

export default () => (
  <>
    <img
      src="https://gw.alipayobjects.com/zos/bmw-prod/877c66b3-ec81-48ca-ad7f-f3a6f7e19b42/kiprxtw0_w1004_h1346.png"
      width="260"
    />
    <img
      src="https://gw.alipayobjects.com/zos/bmw-prod/c18bc2a5-719a-48ca-b225-c79ef88bfb43/k7m10ymd_w1004_h1346.jpeg"
      width="260"
    />
  </>
);
```
