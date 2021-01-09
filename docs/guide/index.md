---
title: Introducation
order: 1
toc: menu
nav:
  title: Guide
  order: 1
---

## What's dumi?

dumi, pronounced like [duːmɪ], is a documentation tool for developing libraries. It can provide one-stop component development experience for developer with [father](https://github.com/umijs/father), in which **father for building and dumi for component development & writting docs**.

## Features

- 📦 Out of the box, focus on component development and documentation
- 📋 Rich Markdown extensions, more than just rendering component demo
- 🏷 Automatically generate component API based on TypeScript type definition
- 🎨 Easily customize the theme, and create your own Markdown components
- 📱 Support mobile component library development, built-in mobile HD rendering solution
- 📡 One-line command digitizes component assets and connects them with downstream productivity tools

## Getting Started

### Environment setup

First, you should have [node](https://nodejs.org/en/), and ensure that the node version is 10.13 or above.

```bash
$ node -v
v10.13.0
```

### Initial scaffold

For convenience of usage, dumi provides two different scaffolds, differences between the two scaffolds can view [Guide - Mode](/config#mode). First, we need to find a place to make an empty directory, and then use scaffold:

```bash
$ mkdir myapp && cd myapp
```

#### Scaffold for components

Scaffold for components includes not only dumi and basic docs, but also a simple component, umi-test, father-build. which can implement processes of developing components, writting docs, coding test cases, build components.

```bash
$ npx @umijs/create-dumi-lib        # initial a scaffold for components in doc mode
# or
$ yarn create @umijs/dumi-lib

$ npx @umijs/create-dumi-lib --site # initial a scaffold for components in site mode
# or
$ yarn create @umijs/dumi-lib --site
```

#### Scaffold for static site

Scaffold for static site is a scaffold in multi-language site mode, which only includes docs.

```bash
$ npx @umijs/create-dumi-app
# or
$ yarn create @umijs/dumi-app
```

### Repository template initialization

We can also use the `dumi-template` repository for initialization, visit https://github.com/umijs/dumi-template to learn more.

![](https://gw.alipayobjects.com/zos/bmw-prod/91791904-cdde-4408-959d-72fd0c9049b1/kj80x6lv_w1918_h352.png)

### Start development

Execute `npm run dev` or `npx dumi dev` to start debugging components or writing documents:

![](https://gw.alipayobjects.com/zos/bmw-prod/a74b9643-b1db-48b0-83b1-67d15e13b6fc/k7a3sl0s_w1988_h1310.png)

### Build and deploy

Execute `npm run build` or `npx dumi build` to build our documentation site. The build product will be output to the `dist` directory by default. We can deploy the `dist` directory to now.sh, GitHub Pages, etc. On a static site hosting platform or a certain server.
