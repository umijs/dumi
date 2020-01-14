---
title: 介绍
order: 10
---

# 介绍

<Alert>
father-doc 仍处于 <code>alpha</code> 阶段，功能可能存在不稳定，如果在使用中出现问题，请反馈到 <a href="https://github.com/umijs/father-doc/issues">https://github.com/umijs/father-doc/issues</a>，感谢 ❤️
</Alert>

father-doc 是基于 Umi 为组件开发场景而生的文档工具，与 [father](https://github.com/umijs/father) 一起为开发者提供一站式的组件开发体验，**father 负责构建，而 father-doc 负责组件开发及文档生成**。

可以直接查看 [文档示例](#/examples)，先睹为快。

## 特性

- 📦 开箱即用，让所有注意力都放在文档编写和组件开发
- 🚀 基于 [Umi](https://umijs.org)，天生高性能、可扩展
- 📋 强大的 Markdown 扩展，可嵌入 Demo、可导入外部 Demo 甚至插入自定义 React 组件
- (未完待续...)

## Todo

- SSR
- 自定义主题 & 更多内置主题
- Code Sandbox
- 插件机制
- ...

## 参与贡献

欢迎加入到 father-doc 的建设队伍中来，请访问 https://github.com/umijs/father-doc 。

``` jsx | inline
import React from 'react';
import gif from './assets/qrcode.jpg';

export default () => <img src={gif} width="300" />
```
