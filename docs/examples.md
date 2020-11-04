---
title: Examples
legacy: /example
nav:
  order: 3
  title: Examples
toc: menu
---

# examples

This page lists various Markdown styles and demos rendered by dumi.

## For Demo

### Embed Code

```jsx
/**
 * debug: true
 */
import React from 'react';
import { Button } from 'antd';

export default () => <Button type="primary">I'm Button from antd</Button>;
```

### Translate TS to JS

<code src="./demo/typescript.tsx" />

### Multiple dependencies

<code src="./demo/modal.jsx" />

### Functional Buttons

<code src="./demo/show-preview.tsx" hideActions='["CSB", "EXTERNAL"]' />

```jsx
/**
 * title: Code Block
 * desc: 'setting by comments in code block. For examples: hideActions: ["CSB", "EXTERNAL"]'
 * hideActions: ["CSB", "EXTERNAL"]
 */
import React from 'react';
import { Button } from 'antd';

export default () => <Button type="primary">I'm for testing</Button>;
```

# Header One

## Header Two

### Header Three

#### Header Four

##### Header Five

###### Header Six

## Horizon Line

---

## Emphasize

**Blod Font**

_Italics Font_

~~Delete~~

## Blockquotes

> Blockquotes can nested
>
> > Blockquotes can nested Blockquotes

## Lists

unordered List

- To create an unordered list, preface each item in the list with `+`、`-` or `*`
- list can nest another list, remember to indent sub-list
  - here is sub-list

ordered list

1. dumi is not based on father
2. dumi is based on Umi
3. the core of dumi is a plugin for Umi

## Code

inline `code`

Code Block:

```
// some code here
```

Highlight

```js
console.log('Hello World!');
```

## Mathematica

Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

$$
L = \frac{1}{2} \rho v^2 S C_L
$$

## Table

| nouns  | explanations                                                                 |
| ------ | ---------------------------------------------------------------------------- |
| father | Library toolkit based on rollup, docz, storybook, jest, prettier and eslint. |
| Umi    | Pluggable enterprise-level react application framework.                      |

cell to right aligned

|  nouns |                                                                 explanations |
| -----: | ---------------------------------------------------------------------------: |
| father | Library toolkit based on rollup, docz, storybook, jest, prettier and eslint. |
|    Umi |                      Pluggable enterprise-level react application framework. |

## Links

[visit Umi official site](https://umijs.org)

automatic transform into Links https://umijs.org
