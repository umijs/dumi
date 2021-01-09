---
toc: menu
nav:
  title: 插件
  order: 4
---

# 插件

## 如何使用

安装插件 npm 包到项目的 `devDependencies` 即可启用该插件，例如：

```bash
$ npm i @umijs/plugin-name -D
```

如果插件有提供配置项，请在 `config/config.ts` 或者 `.umirc.ts` 中进行配置，例如：

```ts
export default {
  // 其他配置项
  field: {},
};
```

## 插件列表

dumi 的背后是 Umi，**这意味 Umi 生态的绝大部分插件都能和 dumi 一起工作**，这里仅列举组件研发可能会用到的插件列表，更多插件可以访问 [Umi 的官方文档](https://umijs.org/plugins/plugin-access)。

### `@umijs/plugin-analytics`

- **简介：** 为文档启用 [Google Analytics](https://analytics.google.com/analytics/web) 或 [百度统计](https://tongji.baidu.com)
- **配置：**

```ts
export default {
  analytics: {
    // Google Analytics 代码，配置后会启用
    ga: 'google analytics code',
    // 百度统计代码，配置后会启用
    baidu: '5a66cxxxxxxxxxx9e13',
  },
};
```

更多信息可访问：[Umi 插件 - @umijs/plugin-analytics](https://umijs.org/zh-CN/plugins/plugin-analytics)。

### `@umijs/plugin-sass`

- **简介：** 启用组件库开发期间的 Sass 编译支持，**注意，该插件启用与否与组件库构建工具（father-build）无关**，如果组件库本身使用了 Sass，我们还需要开启 father-build 的 [Sass 编译支持](https://github.com/umijs/father#sassinrollupmode)
- **配置：**

```ts
export default {
  sass: {
    // 默认值 Dart Sass，如果要改用 Node Sass，可安装 node-sass 依赖，然后使用该配置项
    implementation: require('node-sass'),
    // 传递给 Dart Sass 或 Node Sass 的配置项，可以是一个 Function
    sassOptions: {},
  },
};
```

更多信息可访问：[Umi 插件 - @umijs/plugin-sass](https://umijs.org/zh-CN/plugins/plugin-sass)。

### `@umijs/plugin-esbuild`

- **简介：** 使用 esbuild 作为文档站点产物的压缩器，试验性功能，可能有坑，但压缩提速效果拔群
- **配置：**

```ts
export default {
  esbuild: {}, // 启用 esbuild 压缩
};
```

更多信息可访问：[Umi 插件 - @umijs/plugin-esbuild](https://umijs.org/zh-CN/plugins/plugin-esbuild)。

## 插件开发

如果现有的插件无法满足需求，或者你希望定制 dumi 的一些行为，则可以开发一个自己的插件来实现，在项目中创建一个 `plugin.ts`：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';

export default (api: IApi) => {
  // 编写插件内容
};
```

然后在 dumi 配置文件中启用它即可：

```ts
export default {
  plugins: ['/path/to/plugin.ts'],
};
```

## 插件 API

基础插件 API 由 Umi 提供，包含如下 API。

<!-- Umi 插件内容嵌入占位，目前 Umi 插件文档只有中文，比较尴尬 -->

除此之外，为了便于插件开发者定制 dumi 的行为，dumi 提供了如下插件 API。

### `dumi.getRootRoute`

用于在 `routes` 配置中拿到文档部分的根路由，**该 API 仅用于获取路由**，如果需要修改，请使用下方的 `modifyRoutes` API。调用方式：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';

export default async (api: IApi) => {
  const rootRoute = await api.applyPlugins({
    key: 'dumi.getRootRoute',
    type: api.ApplyPluginsType.modify,
    initialValue: routes,
  });
};
```

### `dumi.modifyAssetsMeta`

用于修改 `dumi assets` 命令产出的资产元数据，如果不了解什么是资产元数据，可访问 [进阶使用 - UI 资产数据化](/zh-CN/guide/advanced#ui-资产数据化)。

该 API 通常用于定制自己团队的资产元数据内容，比如内部有个自动生成 demo 缩略图的服务，可以通过该方式修改最终打进 npm 包的资产元数据。调用方式：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import IAssetsPackage from 'dumi-assets-types';

export default (api: IApi) => {
  api.register({
    key: 'dumi.modifyAssetsMeta',
    fn(pkg: IAssetsPackage) {
      // 处理 pkg 并返回新的 pkg
      return pkg;
    },
  });
};
```

### `dumi.detectCodeBlock`

dumi 在解析 Markdown 时、如果发现了 React 代码块，则会触发此钩子，并将该代码块的信息传入。调用方式：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import { ExampleBlockAsset } from 'dumi-assets-types';

export default (api: IApi) => {
  api.register({
    key: 'dumi.detectCodeBlock',
    fn(block: ExampleBlockAsset) {
      // 可以对 block 做统计、存储等
    },
  });
};
```

### `dumi.detectAtomAsset`

dumi 在解析 Markdown 时、如果检测到对应的组件资产，会触发此钩子，并将该组件的信息传入，比如 `src/Button/index.tsx` 就是一个组件资产。调用方式：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import { AtomAsset } from 'dumi-assets-types';

export default (api: IApi) => {
  api.register({
    key: 'dumi.detectAtomAsset',
    fn(atom: AtomAsset) {
      // 可以对 atom 做统计、存储等
    },
  });
};
```

### `dumi.detectApi`

dumi 在解析 Markdown 时，如果检测到有使用 API 自动生成，会触发此钩子，并将相关 API 数据传。调用方式：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';

export default (api: IApi) => {
  api.register({
    key: 'dumi.detectApi',
    fn({ identifier, data }) {
      // identifier 是 API 导出标识符，data 是 API 属性数据
    },
  });
};
```

### `dumi.modifyThemeResolved`

用于修改 dumi 的主题包解析结果，通常用于定制特有的主题行为，比如想通过 API 新增内置组件等。调用方式：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import { IThemeLoadResult } from '@umijs/preset-dumi/lib/theme/loader';

export default (api: IApi) => {
  api.register({
    key: 'dumi.modifyThemeResolved',
    fn(resolved: IThemeLoadResult) {
      // 修改 resolved 并返回
      return resolved;
    },
  });
};
```
