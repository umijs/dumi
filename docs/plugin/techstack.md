---
title: 添加技术栈
group: 开发
order: 1
---

# 添加技术栈

## IDumiTechStack 接口的实现

为 dumi 开发添加一个技术栈插件，其核心是实现`IDumiTechStack`接口。我们可以通过`defineTechStack`方法实现，
以 Vue SFC 支持为例，下面是一段伪代码：

```ts
import { defineTechStack, wrapDemoWithFn } from 'dumi/tech-stack-utils';
import { logger } from 'dumi/plugin-utils';

export const VueSfcTechStack = defineTechStack({
  name: 'vue3-sfc',
  runtimeOpts: {},
  isSupported(_, lang: string) {
    return ['vue'].includes(lang);
  },
  onBlockLoad(args) {
    // ...
  },
  transformCode(raw, opts) {
    if (opts.type === 'code-block') {
      const js = '...';
      const code = wrapDemoWithFn(js, {
        filename,
        parserConfig: { syntax: 'ecmascript' },
      });
      return `(${code})()`;
    }
    return raw;
  },
});

api.registerTechStack(() => VueSfcTechStack);
```

完整实现请查看[vue/techStack/sfc.ts](https://github.com/umijs/dumi/tree/master/suites/preset-vue/src/vue/techStack/sfc.ts)

其实现分成三个部分：

### transformCode: 编译转换 Internal Demo

官方的`@vue/compiler-sfc`可以将`.vue`文件会被转换为 JS 和 CSS 代码。

我们须将两者封装为一个完整的 ES module，然后利用 `dumi/tech-stack-utils` 提供的`wrapDemoWithFn`函数，将 ES module 转换为 Block Statements（[示例](https://github.com/umijs/dumi/blob/master/crates/swc_plugin_react_demo/src/lib.rs#L131)）。

代码最后只须返回一个 IIFE 表达式即可（**代码在 dumi 编译中必须以一个 JS 表达式的方式存在**）。

### runtimeOpts: 运行时配置

有四个选项可供选择：

```ts
{
  runtimeOpts: {
    compilePath: '...',
    rendererPath: '...',
    pluginPath: '...',
    preflightPath: '...'
  },
}

```

`rendererPath` 指定了 挂载/卸载 Vue 组件的 cancelable 函数所在路径

一个典型的`cancelable`函数如下：

```ts
import type { IDemoCancelableFn } from 'dumi/dist/client/theme-api';
import { createApp } from 'vue';

const renderer: IDemoCancelableFn = function (canvas, component) {
  const app = createApp(component);
  // 抛给 react 处理
  app.config.errorHandler = (err) => {
    throw err;
  };
  app.mount(canvas);
  return () => {
    app.unmount();
  };
};

export default renderer;
```

主要实现了 Vue 应用的创建及挂载，并返回了 Vue 应用的销毁方法。

之后还需将该代码以文件路径的形式提供给 dumi，具体方法分两步：

1. 将上述`cancelable`函数写入临时文件 (一般在.dumi/tmp/{插件名称}目录下，这可以保证能引用到用户安装的库):

```ts
api.onGenerateFiles(() => {
  api.writeTmpFile({
    path: 'renderer.mjs',
    content: `...`, // cancaelable函数
  });
});
```

2. 获取临时文件地址

```ts
function getPluginPath(api: IApi, filename: string) {
  return winPath(
    join(api.paths.absTmpPath, `plugin-${api.plugin.key}`, filename),
  );
}
const rendererPath = getPluginPath(api, 'renderer.mjs');
```

得到的`rendererPath`我们就可以提供给 dumi 了。

`preflightPath` 是和 `rendererPath` 配套的地址，在用户编辑 demo 时， dumi 会在组件被加载之前使用 preflight 进行预加载，并将发现的错误提示给用户。这能有效提升用户的编辑体验，请务必实现。

`preflightPath`的提供方式和`rendererPath`如出一辙，这里就不赘述了。

`compilePath`则是浏览器端 Vue 实时编译库所在地址，dumi 会在用户进行实时代码编辑时，通过

```ts
const { compile } = await import(compilePath);
```

进行实时代码编译。

在实际实现过程中，主要难度还是在于提供轻量的，浏览器端运行的编译器。

常用的浏览器端编译器有[@babel/standalone](https://babeljs.io/docs/babel-standalone)，但其体积过大，使用时请谨慎。

最后的`pluginPath` 主要用于覆盖运行时配置，例如 `modifyCodeSandboxData`，`modifyStackBlitzData`，只要把这些函数所在文件地址提供给 Dumi 即可。

### onBlockLoad: 模块加载

dumi 默认只能对`js`,`jsx`,`ts`,`tsx`文件进行依赖分析并生成相关 asset，对于`.vue`文件则束手无策。我们可以通过`onBlockLoad`来接管默认的加载方式，主要目标是将`.vue`文件编译后进行依赖分析：

```ts
onBlockLoad(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult {
  const result = compileSFC({
    id: args.path,
    code: args.entryPointCode,
    filename: args.filename,
  });
  return {
    type: 'tsx',
    content: Array.isArray(result) ? '' : result.js,
  };
}

```

（Vue 比较特殊，会在编译之后，引入额外的依赖，所以必须全量编译，不能只是简单地将 script 代码抽取出来）

`IDumiTechStack`接口实现之后，我们还需要通过 registerTechStack 注册 Vue SFC

```ts
api.register({
  key: 'registerTechStack',
  stage: 1,
  fn: VueSfcTechStack,
});
```

接下来就得考虑 External Demo 的编译及 API Table 的支持了：

## External Demo 编译支持

添加对 External Demo 的编译及打包支持，这需要我们对 Webpack 进行配置，由于 dumi 本身是 react 框架，所以不能粗暴地移除对 react 的支持，而是需要将 react 相关配置限定在`.dumi`中。

具体配置可参考 [vue/webpack/config.ts](https://github.com/umijs/dumi/tree/master/suites/preset-vue/src/vue/webpack/config.ts)

## API Table 支持

API Table 的支持主要在于对框架元信息信息的提取，例如针对 Vue 组件，dumi 就提供了 [@dumijs/vue-meta](https://github.com/umijs/dumi/tree/master/suites/dumi-vue-meta) 包来提取元数据。其他框架也要实现相关的元数据提取，主流框架基本都有相应的元数据提取包，但需要注意的是，开发者需要适配到 dumi 的元数据 schema（[dumi-assets-types](https://github.com/umijs/dumi/blob/master/assets-types/typings/atom/index.d.ts)） 。

在实现元数据提取之后，还需要实现 dumi 的元数据解析架构，即将数据的提取放在子线程中。dumi 也提供了相关的 API 简化实现：

**子线程侧**，我们需要实现一个元数据 Parser，这里需要实现`LanguageMetaParser`接口

```ts
import { ILanguageMetaParser, IPatchFile } from 'dumi/tech-stack-utils';

class VueMetaParser implements ILanguageMetaParser {
  async patch(file: IPatchFile) {
    // ...
  }
  async parse() {
    // ...
  }

  async destroy() {
    // ...
  }
}
```

`parse`负责数据的解析，`patch`则负责接收从主线程来的文件更新，`destroy`则负责完成子线程销毁前的解析器销毁工作。

之后我们只需要通过`createApiParser`导出相应的 VueApiParser

```ts
import {
  IBaseApiParserOptions,
  ILanguageMetaParser,
  createApiParser,
} from 'dumi/tech-stack-utils';

export const VueApiParser = createApiParser({
  filename: __filename,
  worker: VueMetaParser,
  parseOptions: {
    // 主线程侧，只需要处理文件更改
    handleWatcher(watcher, { parse, patch, watchArgs }) {
      return watcher.on('all', (ev, file) => {
        if (
          ['add', 'change', 'unlink'].includes(ev) &&
          /((?<!\.d)\.ts|\.(jsx?|tsx|vue))$/.test(file)
        ) {
          const cwd = watchArgs.options.cwd!;
          patch({
            event: ev,
            fileName: path.join(cwd, file),
          });
          parse();
        }
      });
    },
  },
});
```

万事俱备，现在只需修改`api.service.atomParser`即可

```ts
api.modifyConfig((memo) => {
  const userConfig = api.userConfig;

  const vueConfig = userConfig?.vue;
  const parserOptions: Partial<VueParserOptions> =
    vueConfig?.parserOptions || {};

  const entryFile = userConfig?.resolve?.entryFile;
  const resolveDir = api.cwd;

  const options = {
    entryFile,
    resolveDir,
  };
  Object.assign(options, parserOptions);

  if (!options.entryFile || !options.resolveDir) return memo;

  api.service.atomParser = VueApiParser(options as VueParserOptions);
  return memo;
});
```

这样在实现功能后，我们就实现了 Vue 框架在 dumi 中的完整支持。照此办法，开发者也可以实现对`svelte`, `Angular`,`lit-element`等框架的支持
