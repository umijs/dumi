---
title: 文档示例
legacy: /example
nav:
  order: 3
  title: 渲染示例
toc: menu
---

# 文档示例

此页面列举了 dumi 渲染各项 Markdown 样式以及 Demo 的效果。

## 渲染 Demo

### 代码块嵌入

```jsx
import React from 'react';
import { Button } from 'antd';

export default () => <Button type="primary">我是 antd 的按钮</Button>;
```

## TS 转 JS

<code src="./demo/typescript.tsx" />

## 多文件依赖

<code src="./demo/modal.jsx" />

## 控制 Demo 预览器的功能按钮

<code src="./demo/show-preview.tsx" hideActions='["CSB", "EXTERNAL"]' />

```jsx
/**
 * title: 代码块
 * desc: '代码块中通过块注释指定，例：hideActions: ["CSB", "EXTERNAL"]'
 * hideActions: ["CSB", "EXTERNAL"]
 */
import React from 'react';
import { Button } from 'antd';

export default () => <Button type="primary">我用来测试</Button>;
```

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

1. dumi 不基于 father
2. dumi 基于 Umi
3. dumi 核心是一个 Umi 插件

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

## 数学公式

Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

$$
L = \frac{1}{2} \rho v^2 S C_L
$$

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
