---
group: 其他
order: 2
---

# 常见问题

## dumi 和 Umi 的关系是什么？

Umi 是前端开发框架，适用于前端应用研发；dumi 是在 Umi 的基础上打造的静态站点框架，适用于组件研发。

## 如何完全自定义首页？

创建 `.dumi/pages/index.tsx` 即可用 React 来编写首页，注意不要同时在文档解析的根目录中创建 index.md，会导致路由冲突。

## dumi 支持使用 `.md` 之外的其他方式编写文档吗？

dumi 约定 `.dumi/pages` 为 React 路由的解析目录，较为复杂的交互式页面可以在这个目录下用 React 编写，路由的生成规则及 FrontMatter 能力与 md 一致。

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

3. 增加配置，新建 `.dumirc.js|ts` 到 `APP_ROOT` 指定的根目录中。dumi 会根据 `APP_ROOT` 来消费配置文件，如果不指定 `APP_ROOT`，则在项目根目录创建即可。

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
# 这是一个 dumi 结合 create-react-app 的 Demo
```

6. 将 dumi 的临时文件添加到 `.gitignore` 中。

```text
.dumi/tmp*
```

## dumi 支持基于其他技术框架、例如 Vue、Angular 编写文档和 Demo 吗？

暂不支持

## 如何添加统计脚本和全局 CSS 样式？

统计脚本可以使用配置项 [analytics](/config#analytics)，全局样式可以添加到 `.dumi/global.{less,css}` 文件内。

## 部署文档

### 非根目录部署

非根目录部署需要修改 Umi 的 [base 配置项](/config#base) 和 **视实际情况** 修改 [publicPath 配置项](/config#publicpath)。

```ts
export default {
  base: '/文档起始路由/',
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
# or
yarn add gh-pages -D
```

`package.json` 中添加

```json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

> 同样的，如果是 react 文档，使用 `gh-pages -d docs-dist`命令即可。

编译生成 `dist` 目录

```bash
# site 模版
npm run build

# react 模版
npm run docs:build
```

一键发布

```bash
npm run deploy
```

#### 自动部署

利用 [Github Action](https://github.com/features/actions) 在每次 `main` 分支更新后自动部署

新建 `.github/workflows/gh-pages.yml` 文件

```yml
name: github pages

on:
  push:
    branches:
      - main # default branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          # 如果配置 themeConfig.lastUpdated 为 false，则不需要添加该参数以加快检出速度
          fetch-depth: 0
      - name: Install dependencies
        run: npm install
      - name: Build with dumi
        # 文档编译命令，如果是 react 模板需要修改为 npm run docs:build
        run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          # 文档目录，如果是 react 模板需要修改为 docs-dist
          publish_dir: ./dist
```

> 如果 actions 部署时遇到 403 错误，可以尝试使用 [Deploy Token](https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-set-ssh-private-key-deploy_key)

## dumi 如何支持对 Swift、C#、Kotlin 等语言的语法高亮？

dumi 语法高亮使用的 [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) ，是一款基于 [PrismJS](https://github.com/PrismJS/prism) 实现的 React 组件。 `PrismJS` 支持的语言种类很多，但 `prism-react-renderer` 在实现的时候对部分语言进行了移除，其具体原因可以查看 [Adding Out of the Box Languages](https://github.com/FormidableLabs/prism-react-renderer/issues/53#issuecomment-546653848)。

我们在 dumi 中可以通过下面的方式，添加对其他语言的支持：

```tsx | pure
// .dumi/global.ts
import Prism from 'prism-react-renderer/prism';

(typeof global !== 'undefined' ? global : window).Prism = Prism;

require('prismjs/components/prism-kotlin');
require('prismjs/components/prism-csharp');
```

## 为什么不支持 CSS Modules？

主要两个原因：

1. 使用者很难覆写样式，因为最终 `className` 不稳定
2. 自动 CSS Modules 依赖 babel 编译产物，给使用项目带来额外的编译成本，而大部分框架默认都不编译 `node_modules`（比如 Umi 框架就需要配置 `extraBabelIncludes` 才会编译 `node_modules` 下的产物）

也许大部分人选择在组件库项目中使用它，是因为做前端应用研发时的习惯性选型，但它其实不适合组件库项目；另外，原因 2 也会产生额外的调时成本：『为什么 dev 生效、发布后在项目里不生效？』

## 为什么组件库发布以后，在项目中引入组件但样式不生效？

> 这里仅讨论**非 CSS-in-JS** 的组件库，CSS-in-JS 的组件库如果存在此问题，应该和组件实现有关。

遇到这个问题说明组件库文档中引入的组件是有样式的，需要先确认文档中样式生效的原因，通常有 3 种可能：

1. 借助 `.dumi/global.less` 加载了组件库样式表
2. 借助 `.dumirc.ts` 中的 `styles` 配置项加载了组件库样式表
3. 借助 `babel-plugin-import` 并将其配置到 `.dumirc.ts` 中按需加载了组件样式

实际上，这些样式引入方案均只对文档构建生效，也就是说它们都是依托于 dumi 框架提供的能力，而组件库发布为 NPM 包以后，组件库的编译将由实际使用组件库的项目负责。

因此，我们需要根据项目使用的开发框架做等价配置，才能确保样式生效，此处以 Umi 项目为例，上述 3 种方案的等价配置方式如下：

1. 借助 `src/global.less` 加载组件库样式表
2. 借助 `.umirc.ts` 中的 `styles` 配置项加载组件库样式表
3. 借助 `babel-plugin-import` 并将其配置到 `.umirc.ts` 中按需加载组件样式

其实该问题还有一种解决思路，那就是直接在组件源码里引入样式表，类似：

```ts
import './index.less';
// or
import './index.css';

// 组件其他源码
```

这样无论是 dumi 还是实际项目里，都不需要做额外配置，但这种做法也有一些限制：如果引入的是 `.less`，那么目标项目的开发框架必须支持编译 Less。

## 是否支持三级导航？

不支持。如果文档目录结构的复杂度超过 3 级，应该考虑优化文档整体结构而非使用三级导航。如果有特殊场景需要，可以自定义主题实现。
