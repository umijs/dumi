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

## 如何在cra等非 umi 项目中使用 dumi？

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
}
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

## 部署到 Github Page

### 手动部署

借助 [gh-pages](https://github.com/tschaub/gh-pages) 可以轻松帮助我们部署文档到 Github Page

```bash
npm install gh-pages --save-dev
```

or

```bash
yarn add gh-pages -D
```

`package.json` 中添加

```json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

编译生成 `dist` 目录

```bash
npm run docs:build
```

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
          publish_dir: ./dist
```
