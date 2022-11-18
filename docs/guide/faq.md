---
group: 其他
order: 2
---

# 常见问题

## dumi 和 Umi 的关系是什么？

dumi 本体是一个 Umi 的 preset——@umijs/preset-dumi，也就是说，我们可以在一个 Umi 的项目中同时使用 dumi。

## 配置项只有这些吗？想实现更多的功能怎么办？

dumi 基于 Umi，即除了自己提供的配置项以外，还支持[所有 Umi 的配置项](https://umijs.org/docs/api/config)，并且也支持 [Umi 生态的插件](https://umijs.org/docs/max/introduce)，所以如果需要更多的功能，可以先看一下 Umi 的配置项和插件生态能否满足，如果仍旧不能，欢迎到[讨论群](/#反馈与共建)反馈或者 GitHub 上[提出 Feature Request](https://github.com/umijs/dumi/issues/new?labels=enhancement&template=feature_request.md&title=feat%3A+)

## 为什么 `README.md` 会出现在文档的首页？

无论是文档还是官网，一定会有首页。dumi 会在 docs 文件夹下寻找 `index.md` 或者 `README.md` 作为首页。`README.md` 的优先级高于 `index.md`。

## 如何完全自定义首页？

目前 dumi 尚未开放主题自定义功能，可以通过引入外部嵌入式 Demo 的形式来实现：

```markdown
<!-- index.md -->

<code src="path/to/homepage.tsx" inline />
```

详细使用可参考 Ant Design Landing 的 [use in dumi](https://landing.ant.design/docs/use/dumi-cn)

## dumi 支持使用 `.md` 之外的其他方式编写文档吗？

暂不支持。

## 如何在 cra 等非 umi 项目中使用 dumi？

1. 安装模块。

```bash
yarn add dumi cross-env -D
```

2. 增加启动命令，修改 `package.json`。

```json
  "scripts": {
    "dumi": "cross-env APP_ROOT=dumi dumi dev",
    "dumi-build": "cross-env APP_ROOT=dumi dumi build"
  },
```

3. 增加配置，新建 `.dumirc`。

```js
export default {
  chainWebpack(memo) {
    memo.plugins.delete('copy');
  },
};
```

4. 新建文档目录 `dumi/docs/`，这里的 `dumi` 目录即第二步中配置的环境变量，你可以随意同步修改。

5. 新建文档 `dumi/docs/index.md`。

```markdown
# 这是一个 Dumi 结合 create-react-app 的 Demo
```

6. 将 dumi 的临时文件添加到 `.gitignore` 中。

```text
.dumi
```

## dumi 支持基于其他技术框架、例如 Vue、Angular 编写文档和 Demo 吗？

暂不支持

## 如何添加统计脚本和全局 CSS 样式？

可使用 Umi 的 [styles](https://umijs.org/docs/api/config#styles) 和 [scripts](https://umijs.org/docs/api/config#scripts) 配置项。

## 部署文档

### 非根目录部署

非根目录部署需要修改 Umi 的 [base 配置项](https://umijs.org/docs/api/config#base) 和 **视实际情况** 修改 [publicPath 配置项](https://umijs.org/docs/api/config#publicpath)。

```ts
export default {
  base: '/文档起始路由',
  publicPath: '/静态资源起始路径/',
  // 其他配置
};
```

> 文档项目独立时, 通常 `base` 和 `publicPath` 配置项相同。

### 部署到 GitHub Pages

由于 GitHub Pages 是非域名根路径部署, `base` 和 `publicPath` 配置项需改为 **仓库名称** 。参考 [非根目录部署](#非根目录部署)

#### 手动部署

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

#### 自动部署

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

## dumi 如何支持对 Swift、C#、Kotlin 等语言的语法高亮？

dumi 语法高亮使用的 [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) ，是一款基于 [PrismJS](https://github.com/PrismJS/prism) 实现的 React 组件。 `PrismJS` 支持的语言种类很多，但 `prism-react-renderer` 在实现的时候对部分语言进行了移除，其具体原因可以查看 [Adding Out of the Box Languages](https://github.com/FormidableLabs/prism-react-renderer/issues/53#issuecomment-546653848)。

我们在 dumi 中可以通过下面的方式，添加对其他语言的支持：

```tsx | pure
// src/app.ts
import Prism from 'prism-react-renderer/prism';

(typeof global !== 'undefined' ? global : window).Prism = Prism;

require('prismjs/components/prism-kotlin');
require('prismjs/components/prism-csharp');
```

## 非 umi 项目启动 dumi 后提示 Error: register failed, invalid key xx from plugin src/app.ts

由于 `src/app.(t|j)sx?` 是 dumi [运行时配置文件](https://umijs.org/zh-CN/docs/directory-structure#appts)的约定，请避开此路径创建文件；如果无法避开命名，可参考上方[修改 APP_ROOT](#如何在 cra 等非 umi 项目中使用 dumi？) 的方式切换 dumi 的运行目录实现规避。
