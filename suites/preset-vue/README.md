# @dumijs/preset-vue

dumi Vue3 technology stack support

## Features

- [x] Supports both Single File Component and JSX/TSX
- [x] Inline demo and external demo support
- [x] Support CodeSandbox and StackBlitz preview
- [x] Webpack processing
- [x] API Table support

## Install

```
npm i @dumijs/preset-vue
```

## Options

### parserOptions

Vue component metadata parsing options

For example, the following configuration can make the `InternalType` type skip parsing

```js
vue: {
  parserOptions: {
    checkerOptions: {
      schema: { ignore: ['InternalType'] }
    },
  },
},
```

For details, please refer to :point_right: [`MetaCheckerOptions`](../dumi-vue-meta/README.md#metacheckeroptions)
