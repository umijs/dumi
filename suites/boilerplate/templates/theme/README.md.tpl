# {{{ name }}}

[![NPM version](https://img.shields.io/npm/v/{{{ name }}}.svg?style=flat)](https://npmjs.org/package/{{{ name }}})
[![NPM downloads](http://img.shields.io/npm/dm/{{{ name }}}.svg?style=flat)](https://npmjs.org/package/{{{ name }}})

A theme package for the [dumi](https://next.d.umijs.org) framework.

## Usage

Install this theme into `devDependencies`:

```bash
$ npm i {{{ name }}} -D
```

Configure it in dumi config file `.dumirc.ts`:

```ts
import { defineConfig } from 'dumi';

export defineConfig({
  themeConfig: {
    ...
  },
});
```

That's all, now you can execute `dumi dev` and enjoy this theme.

## Options

TODO

## Development

```bash
$ {{ npmClient }} install
```

After the dependencies are installed, a symlink from `example/.dumi/theme` to `../../src` will be created automatically, the symlink makes dumi load our theme package as a local theme, so we can start the example directly, HMR is also available:

```bash
# switch to example directory
$ cd example

# start dev server to preview
npm run dev
```

dumi theme development documentation: https://next.d.umijs.org/theme

## LICENSE

MIT
