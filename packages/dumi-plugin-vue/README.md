# dumi-plugin-vue

dumi Vue3 technology stack support

## Features

- [x] Supports both Single File Component and JSX/TSX
- [x] Inline demo and external demo support
- [x] Support CodeSandbox and StackBlitz preview
- [x] Webpack processing
- [x] API Table support

## Install

```
npm i dumi-plugin-vue
```

## Options

### parserOptions

Vue component metadata parsing options

For example, the following configuration can make the `InternalType` type skip parsing

```js
themeConfig: {
  vue: {
    parserOptions: {
      schema: { ignore: ['InternalType'] },
    },
  },
},
```

For details, please refer to :point_right: [`MetaCheckerOptions`](../dumi-vue-meta/README.md#metacheckeroptions)

### globalInject

Global script injection

Vue’s UI framework basically has the usage of global import. Users can use this option to achieve global import. The following configuration can import `ElementPlus`.

```js
themeConfig: {
  vue: {
    globalInject: {
      imports: `
        import ElementPlus from 'element-plus';
        import 'element-plus/dist/index.css';
      `,
      statements: `app.use(ElementPlus, { size: 'small', zIndex: 3000 });`
    },
  },
},
```

The plugin will insert relevant statements into the following templates

```ts
import { App } from 'vue';
// imports here

export function globalInject(app: App<Element>) {
  // statements here
}
```
