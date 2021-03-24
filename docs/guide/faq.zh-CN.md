---
title: 常见问题
order: 4
---

## dumi 和 Umi 的关系是什么？

dumi 本体是一个 Umi 的 preset——@umijs/preset-dumi，也就是说，我们可以在一个 Umi 的项目中同时使用 dumi。但为了避免 Umi 项目的配置项与 dumi 文档的配置项冲突，建议使用 [UMI_ENV](https://umijs.org/zh-CN/docs/env-variables#umi_env) 进行区分。

## 配置项只有这些吗？想实现更多的功能怎么办？

dumi 基于 Umi，即除了自己提供的配置项以外，还支持[所有 Umi 的配置项](https://umijs.org/zh-CN/config)，并且也支持 [Umi 生态的插件](https://umijs.org/zh-CN/plugins/preset-react)，所以如果需要更多的功能，可以先看一下 Umi 的配置项和插件生态能否满足，如果仍旧不能，欢迎到[讨论群](/guide#参与贡献)反馈或者 GitHub 上[提出 Feature Request](https://github.com/umijs/dumi/issues/new?labels=enhancement&template=feature_request.md&title=feat%3A+)

## 为什么 `README.md` 会出现在文档的首页？

无论是文档还是官网，一定会有首页。dumi 会优先在所有的 `resolve.includes` 文件夹下寻找 `index.md` 或者 `README.md`，如果找不到的话则会使用项目根目录的 `README.md`。

## 如何完全自定义首页？

目前 dumi 尚未开放主题自定义功能，可以通过引入外部嵌入式 Demo 的形式来实现：

```markdown
<!-- index.md -->

<code src="path/to/homepage.tsx" inline />
```

详细使用可参考 Ant Design Landing 的 [use in dumi](https://landing.ant.design/docs/use/dumi-cn)

## 如何自定义“编辑此页”？

当您在根目录的 package.json 中设置 `repository` 后，dumi 就会在页面底部生成相应的**编辑功能**按钮。例如：

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

其中:

- `url`：决定跳转仓库仓库路径
- `branch`：对应仓库分支。默认为 `master`
- `platform`：对应平台。当前设置为 `gitlab` 时，若 url 涉及 subgroups 会对其进行特殊处理

## dumi 支持使用 `.md` 之外的其他方式编写文档吗？

暂不支持。

## 如何在 cra 等非 umi 项目中使用 dumi？

[源码示例](https://github.com/xiaohuoni/dumi-demo-cra)

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

3. 增加配置，新建 `dumi/config/config.js`。

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
.umi
```

## dumi 支持基于其他技术框架、例如 Vue、Angular 编写文档和 Demo 吗？

暂不支持；但 Umi 3 在架构上对 renderer 做了抽离，后续如果有其他的 renderer，dumi 也会进行跟进。

## 如何添加统计脚本和全局 CSS 样式？

可使用 Umi 的 [styles](https://umijs.org/zh-CN/config#styles) 和 [scripts](https://umijs.org/zh-CN/config#scripts) 配置项。

## 本地开发没问题，但部署完成后访问子页面再刷新就 404 了

默认只输出一个 `index.html` 作为入口 HTML 文件，服务器在 serve `/` 时可以找到文件但 `/some-route` 却没有对应的 `/some-route/index.html`，所以会出现 404。设置 `config.exportStatic` 为 `{}` 根据路由按文件夹结构输出所有 HTML 文件即可，此配置项的更多用法可参考 Umi 文档：[Config - exportStatic](https://umijs.org/zh-CN/config#exportstatic)。

## 文档构建后的 bundle 太大了，导致网站访问速度很慢，如何实现按需加载？

配置 `config.dynamicImport` 为 `{}`，此配置项的更多用法可参考 Umi 文档：[Config - dynamicImport](https://umijs.org/zh-CN/config#dynamicimport)。

## 部署文档

### 非根目录部署

非根目录部署需要修改 Umi 的 [base 配置项](https://umijs.org/zh-CN/config#base) 和 **视实际情况** 修改 [publicPath 配置项](https://umijs.org/zh-CN/config#publicpath)。

```ts
export default {
  base: '/文档起始路由',
  publicPath: '/静态资源起始路径/',
  exportStatic: {}, // 将所有路由输出为 HTML 目录结构，以免刷新页面时 404
  // 其他配置
};
```

> 文档项目独立时, 通常 `base` 和 `publicPath` 配置项相同。

### 部署到GitHub Pages

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

## 开发阶段，如何配置 md 文件中的样式按需引入？

dumi 会对 pkgName/es、pkgName/lib 做 alias，[详情见](https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/plugins/core.ts#L198)

配置 `extraBabelPlugins` (注意是 `.umirc.ts` 的配置项，不是 `.fatherrc.ts`)，加入 [`babel-plugin-import`](https://github.com/ant-design/babel-plugin-import)，根据目录结构合理配置

例如：

目录结构：

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

配置 .umirc.ts：

```tsx | pure
extraBabelPlugins: [
  [
    'import',
    {
      libraryName: 'lean',
      camel2DashComponentName: false,
      customStyleName: name => {
        return `./style/index.less`; // 注意：这里 ./ 不可省略
      },
    },
    'lean',
  ],
];
```

在 md 中引入组件：

```tsx | pure
import { Button } from 'lean'; // 这里会按需引入样式
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
