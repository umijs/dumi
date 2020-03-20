---
title: dumi - 基于 Umi、为组件开发场景而生的文档工具
order: 10
hero:
  title: dumi
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
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/d1ee0c6f-5aed-4a45-a507-339a4bfe076c/k7bjsocq_w144_h144.png
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
$ mkdir docs && echo '# Hello dumi!' > docs/index.md

// 预览文档
$ dumi dev
```

## 谁在使用

```jsx | inline
import React from 'react';

export default () => (
  <ul style={{ display: 'flex', flexWrap: 'wrap', margin: 0, padding: 0, listStyle: 'none' }}>
    <li
      style={{
        marginRight: 16,
        marginBottom: 8,
        border: '1px solid #eee',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 600,
        borderRadius: 2,
      }}
    >
      <a
        style={{ display: 'block', color: '#666', padding: '18px 32px' }}
        target="_blank"
        href="https://umijs.org"
      >
        <img
          width="32"
          style={{ verticalAlign: '-0.32em', marginRight: 8 }}
          src="https://gw.alipayobjects.com/zos/bmw-prod/598d14af-4f1c-497d-b579-5ac42cd4dd1f/k7bjua9c_w132_h130.png"
        />
        UmiJS
      </a>
    </li>
    <li
      style={{
        marginRight: 16,
        marginBottom: 8,
        border: '1px solid #eee',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 600,
        borderRadius: 2,
      }}
    >
      <a
        style={{ display: 'block', color: '#666', padding: '18px 32px' }}
        target="_blank"
        href="https://hooks.umijs.org"
      >
        <img
          width="32"
          style={{ verticalAlign: '-0.32em', marginRight: 8 }}
          src="https://gw.alipayobjects.com/zos/bmw-prod/598d14af-4f1c-497d-b579-5ac42cd4dd1f/k7bjua9c_w132_h130.png"
        />
        Umi Hooks
      </a>
    </li>
    <li
      style={{
        marginBottom: 8,
        border: '1px solid #eee',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 600,
        borderRadius: 2,
      }}
    >
      <a
        style={{ display: 'block', color: '#666', padding: '18px 32px' }}
        target="_blank"
        href="https://prolayout.ant.design/"
      >
        <img
          width="32"
          style={{ verticalAlign: '-0.32em', marginRight: 8 }}
          src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        />
        Pro Layout
      </a>
    </li>
  </ul>
);
```

## 反馈与共建

请访问 [GitHub](https://github.com/umijs/dumi) 或加入讨论群：

<img src="https://gw.alipayobjects.com/zos/bmw-prod/881c4596-a6cc-4f69-be8d-f94c4e02e058/k7ttshpq_w1004_h1346.jpeg" width="260" />
<img src="https://gw.alipayobjects.com/zos/bmw-prod/c18bc2a5-719a-48ca-b225-c79ef88bfb43/k7m10ymd_w1004_h1346.jpeg" width="260"/>
