---
title: FAQ
---

## dumi 和 Umi 的关系是什么？

dumi 本体是一个 Umi 的 preset——@umijs/preset-dumi，也就是说，我们可以在一个 Umi 的项目中同时使用 dumi。但为了避免 Umi 项目的配置项与 dumi 文档的配置项冲突，建议使用 [UMI_ENV](https://umijs.org/docs/env-variables#umi_env) 进行区分。

## 配置项只有这些吗？想实现更多的功能怎么办？

dumi 基于 Umi，即除了自己提供的配置项以外，还支持[所有 Umi 的配置项](https://umijs.org/config)，并且也支持 [Umi 生态的插件](https://umijs.org/plugins/preset-react)，所以如果需要更多的功能，可以先看一下 Umi 的配置项和插件生态能否满足，如果仍旧不能，欢迎到[讨论群](/guide#参与贡献)反馈或者 GitHub 上[提出 Feature Request](https://github.com/umijs/dumi/issues/new?labels=enhancement&template=feature_request.md&title=feat%3A+)

## 为什么 `README.md` 会出现在文档的首页？

无论是文档还是官网，一定会有首页。dumi 会优先在所有的 `resolve.includes` 文件夹下寻找 `index.md` 或者 `REAdME.md`，如果找不到的话则会使用项目根目录的 `README.md`。

## 如何将文档部署到域名的非根目录？

使用 Umi 的 [base 配置项](https://umijs.org/config#base)即可。

## 如何完全自定义首页？

目前 dumi 尚未开放主题自定义功能，可以通过引入外部嵌入式 Demo 的形式来实现：

```markdown
<!-- index.md -->

<code src="path/to/homepage.tsx" inline />
```

## dumi 支持使用 `.md` 之外的其他方式编写文档吗？

暂不支持。

## 如何在 cra 等非 umi 项目中使用 dumi？

[源码示例](https://github.com/xiaohuoni/dumi-demo-cra)

安装模块。

```bash
yarn add dumi cross-env -D
```

增加启动命令，修改 `package.json`。

```json
  "scripts": {
    "dumi": "cross-env APP_ROOT=dumi dumi dev",
    "dumi-build": "cross-env APP_ROOT=dumi dumi build"
  },
```

增加配置，新建 `config/config.js`。

```js
export default {
  chainWebpack(memo) {
    memo.plugins.delete('copy');
  },
};
```

新建文档目录 `dumi/docs/`，这里的 `dumi` 目录即第二步中配置的环境变量，你可以随意同步修改。

新建文档 `dumi/docs/index.md`。

```markdown
# 这是一个 Dumi 结合 create-react-app 的 Demo
```

将 dumi 的临时文件添加到 `.gitignore` 中。

```
.umi
```

## dumi 支持基于其他技术框架、例如 Vue、Angular 编写文档和 Demo 吗？

暂不支持；但 Umi 3 在架构上对 renderer 做了抽离，后续如果有其他的 renderer，dumi 也会进行跟进。

## 如何添加统计脚本和全局 CSS 样式？

可使用 Umi 的 [styles](https://umijs.org/config#styles) 和 [scripts](https://umijs.org/config#scripts) 配置项。

## 本地开发没问题，但部署完成后访问子页面再刷新就 404 了

默认只输出一个 `index.html` 作为入口 HTML 文件，服务器在 serve `/` 时可以找到文件但 `/some-route` 却没有对应的 `/some-route/index.html`，所以会出现 404。设置 `config.exportStatic` 为 `{}` 根据路由按文件夹结构输出所有 HTML 问价即可，此配置项的更多用法可参考 Umi 文档：[Config - exportStatic](https://umijs.org/zh-CN/config#exportstatic)。

## 文档构建后的 bundle 太大了，导致网站访问速度很慢，如何实现按需加载？

配置 `config.dynamicImport` 为 `{}`，此配置项的更多用法可参考 Umi 文档：[Config - dynamicImport](https://umijs.org/zh-CN/config#dynamicimport)。

## 部署到 Github Pages

由于 GitHub Pages 是非域名根路径部署，部署之前请先确保设置了 `base` 和 `publicPath` 配置项为仓库名称：

```ts
export default {
  base: '/仓库名称',
  publicPath: '/仓库名称/',
  exportStatic: {}, // 将所有路由输出为 HTML 目录结构，以免刷新页面时 404
  // 其他配置
};
```

### 手动部署

一键发布

```bash
npm run deploy
```

### 自动部署

利用 [Github Action](https://github.com/features/actions) 在每次 `master` 分支更新后自动部署

新建 `.github/workflows/gh-pages.yml` 文件

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
