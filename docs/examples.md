---
title: 文档示例
legacy: /example
---

# 文档示例

## Demo 嵌入

```jsx
import React from 'react';
import { Button } from 'antd';

export default () => <Button type="primary">我是 antd 的按钮</Button>;
```

## 外部 Demo

<code src="./demo/modal.jsx" />

## TS 转 JS

<code src="./demo/typescript.tsx" />

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 水平线

---

## 强调样式

**字体加粗**

_斜体样式_

~~删除线样式~~

## 引用

> 引用可以被嵌套
>
> > 只要引用符号比上一级多就能产生嵌套

## 列表

无序列表

- 使用 `+`、`-` 或 `*` 来创建无序列表
- 列表可以嵌套，嵌套会产生缩进
  - 我是子列表项

有序列表

1. father-doc 不基于 father
2. father-doc 基于 Umi
3. father-doc 核心是一个 Umi 插件

## 代码

行内 `code`

代码块：

```
// some code here
```

语法高亮

```js
console.log('Hello World!');
```

## 表格

| 名词   | 解释                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| father | Library toolkit based on rollup, docz, storybook, jest, prettier and eslint. |
| Umi    | Pluggable enterprise-level react application framework.                      |

单元格右对齐

|   名词 |                                                                         解释 |
| -----: | ---------------------------------------------------------------------------: |
| father | Library toolkit based on rollup, docz, storybook, jest, prettier and eslint. |
|    Umi |                      Pluggable enterprise-level react application framework. |

## 超链接

[前往 Umi 官网](https://umijs.org)

自动转换超链接 https://umijs.org
