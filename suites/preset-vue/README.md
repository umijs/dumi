# @dumijs/preset-vue

dumi Vue3 tech stack support

## Features

- [x] Supports both Single File Component and JSX/TSX
- [x] Inline demo and external demo support
- [x] Support CodeSandbox and StackBlitz preview
- [x] Webpack processing
- [x] API Table support
- [x] Support live demo

## Install

```
npm i @dumijs/preset-vue
```

## Options

### checkOptions

Vue component metadata parsing options

For example, the following configuration can make the `InternalType` type skip parsing

```js
vue: {
  checkerOptions: {
    ignore: ['InternalType']
  },
},
```

For details, please refer to :point_right: [`MetaCheckerOptions`](../dumi-vue-meta/README.md#metacheckeroptions)

### tsconfigPath

The tsconfig used by the checker, the default value is `<project-root>/tsconfig.json`

## directory

By default, this option is the repository.directory option in package.json.

Mainly used to change the root directory of checker, must be a relative directory.

By default, if your project is in a Monorepo, the root directory of the parser is the Monorepo project directory

### compiler

The live demo requires a browser-side compiler, so @babel/standalone needs to be loaded. We provide the `babelStandaloneCDN` option to change its loading address. The default url is
`https://cdn.bootcdn.net/ajax/libs/babel-standalone/7.22.17/babel.min.js`

```js
vue: {
  compiler: {
    babelStandaloneCDN: 'https://cdn.bootcdn.net/ajax/libs/babel-standalone/7.22.17/babel.min.js'
  },
},
```
