---
title: FAQ
order: 4
---

## What is the relationship between dumi and Umi?

The dumi actually is a preset of Umi —— @umijs/preset-dumi, which means that we can use dumi in a Umi project at the same time. However, in order to avoid conflicts between the configurations of the Umi project and the dumi document, it is recommended to use [UMI_ENV](https://umijs.org/docs/env-variables#umi_env) to distinguish.

## Are these all configurations? What if I need more features?

dumi is based on Umi, Which means in addition to the configurations provided by itself, it also supports [all configurations of Umi](https://umijs.org/config), and also supports [the plugins of Umi](https://umijs.org/plugins/preset-react), so if you need more features, you can first check whether Umi's configurations and plugins can be satisfied. If still cannot be satisfied, welcome to feedback to [the discuss group](/guide#contributing) or [give a Feature Request](https://github.com/umijs/dumi/issues/new?labels=enhancement&template=feature_request.md&title=feat%3A+) on GitHub

## Why `README.md` appears on the homepage of the document?

Whether it is a document or an website, there must be a home page. Dumi will first look for `index.md` or `README.md` as the homepage in all `resolve.includes` folders, if not found, it will use `README.md` in the project root directory as the homepage.

## How to fully customize the homepage?

At present, dumi has not yet support the theme customization function, but it can be realized by importing the external embedded Demo:

```markdown
<!-- index.md -->

<code src="path/to/homepage.tsx" inline />
```

For detailed usage, please refer to [use in dumi](https://landing.ant.design/docs/use/dumi) of Ant Design Landing

## How to customize "Edit this page"?

When you set the `repository` in the package.json of the root directory, dumi will generate the corresponding **edit doc** button at the bottom of the page. E.g:

```json
// package.json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/umijs/dumi.git",
    "branch": "master",
    "platform": "github"
  }
}
```

Among:

- `url`: Decide to jump to the repository path
- `branch`: Corresponding to the repository branch. Default is `master`
- `platform`: Corresponding platform. When the current setting is `gitlab`, if the url involves subgroups, it will be treated specially

## Does dumi support to write documents in other ways rather than `.md`?

Sorry, it is not supported yet

## How to use dumi in non-Umi projects such as cra?

[Source code](https://github.com/xiaohuoni/dumi-demo-cra)

1. Install the dependence.

```bash
yarn add dumi cross-env -D
```

2. Add a start-up command in `package.json`

```json
  "scripts": {
    "dumi": "cross-env APP_ROOT=dumi dumi dev",
    "dumi-build": "cross-env APP_ROOT=dumi dumi build"
  },
```

3. Create `dumi/config/config.js`, and add configuration

```js
export default {
  chainWebpack(memo) {
    memo.plugins.delete('copy');
  },
};
```

4. Create a new document directory `dumi/docs/`, where the `dumi` directory is the environment variable configured in the second step, you can modify it at will.

5. Create `dumi/docs/index.md`.

```markdown
# This is a demo of dumi combined with create-react-app
```

6. Add the temporary files of dumi into `.gitignore`.

```text
.umi
```

## Does dumi support to write documents and demos based on other frameworks, such as Vue and Angular?

Sorry, it's not supported yet. But Umi 3 has abstracted the renderer from the structure. If there are other renderers in the future, dumi will also follow up.

## How to add statistical scripts and global CSS styles?

You can configurate it through [styles](https://umijs.org/config#styles) and [scripts](https://umijs.org/config#scripts) of Umi.

## Local development is works, but will get a 404 after deployment and visiting

There is only one `index.html` is output as the entry HTML file by default. The server can find the file while path is `/` but `/some-route` does not have a corresponding `/some-route/index.html`, so it will get a 404. You can set `config.exportStatic` to `{}` which is means output all HTML files in a folder structure according to the route. For more usage of this configuration, please refer to the Umi document: [Config - exportStatic](https://umijs.org/config#exportstatic).

## The bundle after document building is too large, which brings about slow website access. How to implement load-on-demand mode?

You can set `config.dynamicImport` to `{}`. For more usage fo this configuration, please refer to the Umi document: [Config - dynamicImport](https://umijs.org/config#dynamicimport).

## Deploy documents

### Deploy to a non-root directory of domain

Configurating [base](https://umijs.org/config#base) and [publicPath](https://umijs.org/config#publicpath) (depends on the actual situation) of Umi will works

```ts
export default {
  base: '/docs-base-route-path',
  publicPath: '/assets-files-base-path/',
  exportStatic: {}, // Export all routes as HTML directory structure to avoid 404 when refreshing the page
  // Other configuration
};
```

> If the document project were independent, you would configure `base` and `publicPath` as same!

### Deploy on Github Pages

Since GitHub Pages is deployed in a non-domain name root path, the `base` and `publicPath` configurations are set to the repository name before deployment. See [Deploy to a non-root directory of domain](#deploy-to-a-non-root-directory-of-domain)

#### Manual deployment

With the help of [gh-pages](https://github.com/tschaub/gh-pages), you can easily deploy documents to Github Page

```bash
npm install gh-pages --save-dev
```

or

```bash
yarn add gh-pages -D
```

Add in `package.json`

```json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

Compile to `dist` directory

```bash
npm run docs:build
```

One-click release

```bash
npm run deploy
```

#### Automatic deployment

With the help of [Github Action](https://github.com/features/actions), projects will automatically deployed after each update of `master` branch

Create `.github/workflows/gh-pages.yml`

```yml
name: github pages

on:
  push:
    branches:
      - master # default branch

jobs:
  deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run docs:build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-dist
```

## During the development, how to configure the styles in the md file in load-on-demand?

Dumi will alias pkgName/es, pkgName/lib, [for details, see](https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/plugins/core.ts#L198)

Configure `extraBabelPlugins` (Attention, it is a configuration of `.umirc.ts`, not `.fatherrc.ts`), add [`babel-plugin-import`](https://github.com/ant-design/babel-plugin-import), and configure reasonably according to the directory structure.

For example：

Here is the directory structure：

```shell
.
├── scripts
│   └── hack-depend.js
├── src
│   ├── Button
│   │   ├── style
│   │   │   ├── index.less
│   │   │   └── mixin.less
│   │   ├── index.md
│   │   └── index.tsx
│   ├── style
│   │   ├── base.less
│   │   ├── color.less
│   │   └── mixin.less
│   └── index.ts
├── .editorconfig
├── .fatherrc.ts
├── .gitignore
├── .prettierignore
├── .prettierrc
├── .umirc.ts
├── README.md
├── package.json
├── tsconfig.json
├── typings.d.ts
└── yarn.lock
```

In .umirc.ts：

```tsx | pure
extraBabelPlugins: [
  [
    'import',
    {
      libraryName: 'lean',
      camel2DashComponentName: false,
      customStyleName: name => {
        return `./style/index.less`; // Attention: the ./ cannot be omitted in here
      },
    },
    'lean',
  ],
];
```

Import component in md:

```tsx | pure
import { Button } from 'lean'; // load-on-demand styles here
```

## How does dumi support to highlight for languages such as Swift, C#, Kotlin?

The [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) used for highlighting in dumi, is a React component based on [PrismJS](https://github.com/PrismJS/prism). `PrismJS` supports many languages, but `prism-react-renderer` has removed some languages when implemented. For more specific reasons, please refer to [Adding Out of the Box Languages](https://github.com/FormidableLabs/prism-react-renderer/issues/53#issuecomment-546653848)

We can add support for other languages in dumi in the following ways:

```tsx | pure
// src/app.ts
import Prism from 'prism-react-renderer/prism';

(typeof global !== 'undefined' ? global : window).Prism = Prism;

require('prismjs/components/prism-kotlin');
require('prismjs/components/prism-csharp');
```

## Use dumi in non-Umi project then got Error: register failed, invalid key xx from plugin src/app.ts

Because of `src/app.(t|j)sx?` is dumi's [runtime configuration module](https://umijs.org/docs/directory-structure#appts), please avoid use this path, you can also use the [APP_ROOT way](#How to use dumi in non-Umi projects such as cra?) to workaround this if your project must use this path.
