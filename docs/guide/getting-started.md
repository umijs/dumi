---
title: Getting Started
order: 9
nav:
  order: 10
---

## Environment setup

First, you should have [node](https://nodejs.org/en/), and ensure that the node version is 10.13 or above

```bash
$ node -v
v10.13.0
```

## Initial scaffold

For convenience of usage, dumi provides two different scaffolds, differences between the two scaffolds can view [指南-多种呈现模式](https://d.umijs.org/guide/mode). First, we need to find a place to make an empty directory, and then use scaffold:

```bash
$ mkdir myapp && cd myapp
```

### Scaffold for components

Scaffold for components includes not only dumi and basic docs, but also a simple component, umi-test, father-build. which can implement processes of developing components, writting docs, coding test cases, build components.

```bash
$ npx @umijs/create-dumi-lib        # initial a scaffold for components in doc mode
# or
$ yarn create @umijs/dumi-lib

$ npx @umijs/create-dumi-lib --site # initial a scaffold for components in site mode
# or
$ yarn create @umijs/dumi-lib --site
```

### Scaffold for static site

Scaffold for static site is a scaffold in multi-language site mode, which only includes docs

```bash
$ npx @umijs/create-dumi-app
# or
$ yarn create @umijs/dumi-app
```

## Initial in manual way

### Install

Create an empty directory, and then execute following command in the directory to install:

```bash
$ npm i dumi -D
```

### Start to write docs

Dumi will search markdown files which are in the `docs`, `src` (or `src` of each lerna package) directory automatically, we could create a simplest doc first:

```bash
$ mkdir src && echo '# Hello dumi!' > src/index.md
```

And then execute `npx dumi dev`, the doc will appear in front of you:

![](https://gw.alipayobjects.com/zos/bmw-prod/ed83bd75-06c5-4aa5-a149-5918b072cbee/k7a3kkzb_w1978_h1330.png)

### Try to write a demo

Dumi will consider `jsx/tsx` code block as React Component to render, then take it into demo wrapper, We could modify to following content in `src/index.md`:

<pre>
# Hello dumi!

```jsx
import React from 'react';

export default () => &lt;h2&gt;First Demo&lt;/h2&gt;;
```
</pre>

Our first demo is running after saving:

![](https://gw.alipayobjects.com/zos/bmw-prod/a74b9643-b1db-48b0-83b1-67d15e13b6fc/k7a3sl0s_w1988_h1310.png)

Is it simple? However, is's easy to write a demo but difficult to write a good demo. Dumi has some idea and principles that want to share with you about how to write a demo: [dumi 的 Demo 理念](/guide/demo-principle).
