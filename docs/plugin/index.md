---
toc: menu
nav:
  title: Plugin
  order: 4
---

# Plugin

## How to use

Install the plugin npm package to the `devDependencies` of the project to enable the plugin, for example:

```bash
$ npm i @umijs/plugin-name -D
```

If the plug-in provides configuration items, please configure in `config/config.ts` or `.umirc.ts`, for example:

```ts
export default {
  // Other configuration items
  field: {},
};
```

## Plugin list

Behind dumi is Umi. **This means that most of the plugins in the Umi ecosystem can work with dumi**.

Here is only a list of plugins that may be used in component development. For more plugins, please visit [Umi's official document](https://umijs.org/plugins/plugin-access).

### `@umijs/plugin-analytics`

- **Introduction:** Enable [Google Analytics](https://analytics.google.com/analytics/web) or [Baidu Statistics](https://tongji.baidu.com) for documents
- **Configuration:**

```ts
export default {
  analytics: {
    // Google Analytics code, will be enabled after configuration
    ga: 'google analytics code',
    // Baidu statistics code, will be enabled after configuration
    baidu: '5a66cxxxxxxxxxx9e13',
  },
};
```

For more information, please visit: [Umi plugin - @umijs/plugin-analytics](https://umijs.org/zh-CN/plugins/plugin-analytics).

### `@umijs/plugin-sass`

- **Introduction:** Enable Sass compilation support during component library development. **Note that whether the plugin is enabled or not has nothing to do with the component library building tool (father-build)**. If the component library itself uses Sass, we also need to enable father-build [Sass compilation support](https://github.com/umijs/father#sassinrollupmode)
- **Configuration:**

```ts
export default {
  sass: {
    // The default value is Dart Sass. If you want to use Node Sass instead, you can install the node-sass dependency and use this configuration item
    implementation: require('node-sass'),
    // The configuration item passed to Dart Sass or Node Sass can be a Function
    sassOptions: {},
  },
};
```

For more information, please visit: [Umi plugin - @umijs/plugin-sass](https://umijs.org/zh-CN/plugins/plugin-sass).

### `@umijs/plugin-esbuild`

- **Introduction:** Use esbuild as the compressor of the document site product. It is an experimental feature and may have pits, but the compression speed effect is outstanding
- **Configuration:**

```ts
export default {
  esbuild: {}, // Enable esbuild compression
};
```

For more information, please visit: [Umi plugin - @umijs/plugin-esbuild](https://umijs.org/zh-CN/plugins/plugin-esbuild).

## Plugin development

If the existing plugins cannot meet the needs, or you want to customize some behaviors of dumi, you can develop your own plug-in to achieve this, and create a `plugin.ts` in the project:

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';

export default (api: IApi) => {
  // Write plugin content
};
```

Then enable it in the dumi configuration file:

```ts
export default {
  plugins: ['/path/to/plugin.ts'],
};
```

## Plugin API

dumi completely inherits Umi plugin system, we can check out the [Plugin Best Practice](https://umijs.org/plugins/best-practice) from Umi to lean more about plugin development, and check out the [Plugin API](https://umijs.org/plugins/api) from Umi to lean about the basic APIs we can use.

In addition, dumi provides the following APIs to help us customize dumi's behavior.

### `dumi.getRootRoute`

Used to get the root route of the document part in the `routes` configuration.

**This API is only used to get routes**. If you need to modify it, please use the `modifyRoutes` API below. Calling method:

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

Used to modify the asset metadata produced by the `dumi assets` command.

If you don’t know what asset metadata is, you can visit [Advanced - UI assets meta data](/guide/advanced#ui-assets-meta-data).

This API is usually used to customize the asset metadata content of your team. For example, there is an internal service that automatically generates demo thumbnails.

You can use this method to modify the asset metadata that is finally entered into the npm package. Calling method:

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import IAssetsPackage from 'dumi-assets-types';

export default (api: IApi) => {
  api.register({
    key: 'dumi.modifyAssetsMeta',
    fn(pkg: IAssetsPackage) {
      // Process pkg and return new pkg
      return pkg;
    },
  });
};
```

### `dumi.detectCodeBlock`

When dumi is parsing Markdown, if it finds a React code block, it will trigger this hook and pass in the code block information. Calling method:

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import { ExampleBlockAsset } from 'dumi-assets-types';

export default (api: IApi) => {
  api.register({
    key: 'dumi.detectCodeBlock',
    fn(block: ExampleBlockAsset) {
      // You can do statistics, storage, etc. on the block
    },
  });
};
```

### `dumi.detectAtomAsset`

When dumi is parsing Markdown, if the corresponding component asset is detected, this hook will be triggered and the information of the component will be passed in.

For example, `src/Button/index.tsx` is a component asset. Calling method:

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import { AtomAsset } from 'dumi-assets-types';

export default (api: IApi) => {
  api.register({
    key: 'dumi.detectAtomAsset',
    fn(atom: AtomAsset) {
      // Statistics and storage of atom can be done
    },
  });
};
```

### `dumi.detectApi`

When dumi is parsing Markdown, if it detects that it is automatically generated using API, this hook will be triggered and related API data will be transmitted. Calling method:

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';

export default (api: IApi) => {
  api.register({
    key: 'dumi.detectApi',
    fn({ identifier, data }) {
      // identifier is the API export identifier, data is the API attribute data
    },
  });
};
```

### `dumi.modifyThemeResolved`

Use to modify the analysis result of dumi's theme package, usually used to customize unique theme behavior, such as adding built-in components through API. Calling method:

```ts
// /path/to/plugin.ts
import { IApi } from 'dumi';
import { IThemeLoadResult } from '@umijs/preset-dumi/lib/theme/loader';

export default (api: IApi) => {
  api.register({
    key: 'dumi.modifyThemeResolved',
    fn(resolved: IThemeLoadResult) {
      // Modify resolved and return
      return resolved;
    },
  });
};
```

### `dumi.registerCompiletime`

Use to register custom demo compiletime, the `transformer` will be called when compiling Markdown code block or external demo via `code` tag, and we can replace the demo node to a wrapped React component in this stage, to implement render non-React tech stack demo.

Usage:

```ts
// /path/to/plugin.ts
export default (api) => {
  // register compiletime
  api.register({
    key: 'dumi.registerCompiletime',
    fn: () => ({
      // unique compiletime name
      name: 'test',
      // runtime demo renderer component, must be a React Component
      component: path.join(__dirname, 'renderer.js'),
      // demo mdAST node transformer
      transformer: (
        // input:
        // {
        //   attrs: Record<string, any>,   attributes from code tag
        //   mdAbsPath: string,            file absolute path of current Markdown file
        //   node: mdASTNode,              demo mdAST node
        // }
        opts,
      ) => {
        // implementation...

        // output type refer: https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/transformer/remark/previewer/builtin.ts#L50
        return {
          // props for Previewer component
          previewerProps: {
            // source codes to show
            sources: {
              'index.tsx': { path: '/path/to/disk/file' },
            },
            // 3rd-party dependencies for this demo
            dependencies: { antd: { version: '^4.0.0' } },
          },
          // props for demo renderer, will pass to the registered component above
          rendererProps: { text: 'World!' },
        };
      },
    }),
  });
}
```
More informatios: [#804](https://github.com/umijs/dumi/pull/804)。
