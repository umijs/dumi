---
title: 安装插件
group:
  title: 使用vue
  order: 1
order: 1
---

# 安装 Vue 支持插件 <Badge>实验性</Badge>

dumi 中对 Vue 的支持主要通过`@dumijs/preset-vue`插件集实现, 目前只支持 Vue3

## 安装

```bash
pnpm i vue
pnpm i -D @dumijs/preset-vue
```

:::warning
如果您的 Vue 版本低于 3.3.6，请安装`@vue/compiler-sfc`
:::

## 配置

```ts
// .dumirc.ts
export default {
  presets: ['@dumijs/preset-vue'],
};
```

## 插件选项

### checkerOptions

Vue 组件元数据解析选项

例如，以下配置可以使得名称为`InternalType`的类型跳过检查

```ts
// .dumirc.ts
export default {
  presets: ['@dumijs/preset-vue'],
  vue: {
    checkerOptions: {
      ignore: ['InternalType'],
    },
  },
};
```

默认情况下，从`node_modules`中引入所有类型不会被解析，这样可以有效避免元信息冗余，你也可以通过配置`exclude`来定制化类型引入

```ts
// .dumirc.ts
export default {
  presets: ['@dumijs/preset-vue'],
  vue: {
    checkerOptions: {
      exclude: [/node_modules/, /mylib/],
    },
  },
};
```

关于 checkerOptions 更多的选项请查看： [`MetaCheckerOptions`](https://github.com/umijs/dumi/tree/master/suites/dumi-vue-meta/README.md#metacheckeroptions)

### tsconfigPath

TypeChecker 使用的 tsconfig，默认值为 `<project-root>/<directory>/tsconfig.json`

> 默认情况下，如果您的项目位于 Monorepo 中，则 `<project-root>` 为 Monorepo 项目目录；而 `<directory>` 则为 `package.json` 中的 `repository.directory` 选项

## directory

默认情况下，该选项是 `package.json` 中的 `repository.directory` 选项

### compiler

Live demo 需要浏览器端的编译器，因此需要加载@babel/standalone。我们提供 `babelStandaloneCDN` 选项来更改其加载地址。默认 CDN 是
`https://cdn.bootcdn.net/ajax/libs/babel-standalone/7.22.17/babel.min.js`

```js
vue: {
  compiler: {
    babelStandaloneCDN: 'https://cdn.bootcdn.net/ajax/libs/babel-standalone/7.22.17/babel.min.js'
  },
},
```
