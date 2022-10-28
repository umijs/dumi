# father-plugin-dumi-theme

[![NPM version](https://img.shields.io/npm/v/father-plugin-dumi-theme.svg?style=flat)](https://npmjs.org/package/father-plugin-dumi-theme) [![NPM downloads](http://img.shields.io/npm/dm/father-plugin-dumi-theme.svg?style=flat)](https://npmjs.org/package/father-plugin-dumi-theme)

The father plugin for develop dumi theme package.

## Usage

## `create-dumi`

It is recommended to use `create-dumi` to start developing a new dumi theme package:

```bash
$ npx create-dumi # then select `theme`
```

This plugin is included in the template.

### Manually

Install this plugin in `devDependencies`:

```bash
$ npm i father-plugin-dumi-theme -D
```

Register it in `.fatherrc.ts`:

```ts
import { defineConfig } from 'father';

export default defineConfig({
  plugins: ['father-plugin-dumi-theme'],
});
```

## Development

```bash
$ pnpm install
```

```bash
$ npm run dev
$ npm run build
```

## LICENSE

MIT
