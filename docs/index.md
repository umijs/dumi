---
title: 介绍
order: 10
hero:
  title: Dumi
  desc: 基于 Umi、为组件开发场景而生的文档工具
  actions:
    - text: 快速上手
      link: /guide/getting-started
features:
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/881dc458-f20b-407b-947a-95104b5ec82b/k79dm8ih_w144_h144.png
    title: 开箱即用
    desc: 考究的默认配置和约定式的目录结构，帮助开发者零成本上手，让所有注意力都能放在文档编写和组件开发上
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/d60657df-0822-4631-9d7c-e7a869c2f21c/k79dmz3q_w126_h126.png
    title: 高性能
    desc: 有强大的 Umi 做底座，天生高性能、可扩展，且可使用 Umi 生态中的大部分插件
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/4c797e8e-2620-4713-9754-16fe7060dd35/k79dlvqz_w144_h114.png
    title: 为组件开发而生
    desc: 独特的 Markdown 扩展，可嵌入 Demo、可导入外部 Demo 甚至插入自定义 React 组件，使得组件的文档不仅能看，还好用
footer: Open-source MIT Licensed | Copyright © 2019-present<br />Powered by self
---

## 轻松上手

手动创建第一篇文档

```bash
// 创建组件开发的目录
$ mkdir library && cd library

// 安装 dumi
$ npm i dumi

// 创建文档
$ mkdir docs && echo "# Hello dumi!" > docs/index.md

// 预览文档
$ dumi dev
```

## 反馈与共建

请访问 [GitHub](https://github.com/umijs/dumi) 或加入钉钉群：

```jsx | inline
import React from 'react';
import gif from './assets/qrcode.jpg';

export default () => <img src={gif} width="300" />;
```
