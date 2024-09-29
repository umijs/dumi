# {{{ name }}}

[![NPM version](https://img.shields.io/npm/v/{{{ name }}}.svg?style=flat)](https://npmjs.org/package/{{{ name }}})
[![NPM downloads](http://img.shields.io/npm/dm/{{{ name }}}.svg?style=flat)](https://npmjs.org/package/{{{ name }}})

{{{ description }}}

## Usage

First, introduce css file:

```ts
import '{{ name }}/dist/style.css';
```

Then, introduce components:

```html
<script setup lang="ts">
  import { Foo, Bar } from '{{ name }}';
</script>
```

## Options

TODO

## Development

```bash
# install dependencies
$ {{ npmClient }} install

# develop library by docs demo
$ {{ npmClient }} start

# build library source code
$ {{ npmClient }} run build

# build library source code in watch mode
$ {{ npmClient }} run build:watch

# build docs
$ {{ npmClient }} run docs:build

# Locally preview the production build.
$ {{ npmClient }} run docs:preview

# check your project for potential problems
$ {{ npmClient }} run doctor

# Test
$ {{ npmClient }} test

# Coverage
$ {{ npmClient }} test:cov

# Lint
$ {{ npmClient }} lint
```

## LICENSE

MIT
