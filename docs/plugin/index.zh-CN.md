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

dumi 完全使用 Umi 的插件体系，可访问 Umi 的[插件开发最佳实践](https://umijs.org/zh-CN/plugins/best-practice)  了解如何开发一款插件，还可访问 Umi 的 [插件 API](https://umijs.org/zh-CN/plugins/api) 了解我们可以使用哪些基础 API。

除了基础 API，dumi 还提供了如下插件 API 以便于开发者定制 dumi 的行为。

### `dumi.getRootRoute`

用于在 `routes` 配置中拿到文档部分的根路由，**该 API 仅用于获取路由**，如果需要修改，请使用下方的 `modifyRoutes` API。调用方式：

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';

export default async (api: IApi) => {
  const rootRoute = await api.applyPlugins({
    key: 'dumi.getRootRoute',
    type: api.ApplyPluginsType.modify,
    initialValue: await api.getRoutes(),
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

### `dumi.registerCompiletime`

用于注册自定义 demo 编译时，会在编译 Markdown 代码块或 `code` 标签引入的外部 demo 时被触发，开发者可以在这个环节将 demo 渲染节点替换成自行包装过的 React 组件，在该 React 组件中做其他技术栈的渲染。

使用方式：

```ts
// /path/to/plugin.ts
export default (api) => {
  // 注册编译时
  api.register({
    key: 'dumi.registerCompiletime',
    fn: () => ({
      // 编译时名称，唯一
      name: 'test',
      // demo 渲染组件
      component: path.join(__dirname, 'previewer.js'),
      // demo 语法树节点编译函数
      transformer: (
        // 入参，类型：
        // {
        //   attrs: Record<string, any>,   code 标签的属性
        //   mdAbsPath: string,            当前 Markdown 文件的路径
        //   node: mdASTNode,              语法树节点
        // }
        opts,
      ) => {
        // 从其他技术栈工具中获取 demo 渲染需要的内容，例如 dev server 的产物地址等
        // 出参类型参考：https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/transformer/remark/previewer/builtin.ts#L50
        return {
          // 传递给主题预览组件 Previewer 的 props
          previewerProps: {
            // 需要展示的源代码
            sources: {
              'index.tsx': { path: '/path/to/disk/file' },
            },
            // 该 demo 依赖的三方库
            dependencies: { antd: { version: '^4.0.0' } },
          },
          // demo 渲染器的 props，会传递给上面注册的渲染器组件
          rendererProps: { text: 'World!' },
        };
      },
    }),
  });
}
```
更多信息参考：[#804](https://github.com/umijs/dumi/pull/804)。
