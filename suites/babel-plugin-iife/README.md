# babel-plugin-iife

Convert module files into iife execution statements

## Install

```bash
$ pnpm i babel-plugin-iife
```

## Configuration in babel

```json
{
  "plugins": [["babel-plugin-iife", {}]]
}
```

## Options

### wrappedByIIFE

Type: `boolean`

Default: true

Whether to use IIFE module, the default is true

### forceAsync?: boolean

Type: `boolean`

Default: `undefined`

It can be set only when wrappedByIIFE is true, which is used to specify the callee function in IIFE as an asynchronous function.

## LICENSE

MIT
