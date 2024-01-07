---
title: 添加技术栈
group: 开发
order: 1
---

# 添加技术栈

## IDumiTechStack 接口的实现

为 dumi 开发添加一个技术栈插件，其核心是实现`IDumiTechStack`接口，我们以实现 Vue SFC 支持为例：

```ts
import type {
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
  IDumiTechStackRenderType,
} from 'dumi/tech-stack-utils';
import { extractScript, transformDemoCode } from 'dumi/tech-stack-utils';
import hashId from 'hash-sum';
import type { Element } from 'hast';
import { dirname, resolve } from 'path';
import { logger } from 'umi/plugin-utils';
import { VUE_RENDERER_KEY } from '../../constants';
import { COMP_IDENTIFIER, compileSFC } from './compile';

export default class VueSfcTechStack implements IDumiTechStack {
  name = 'vue3-sfc';

  isSupported(_: Element, lang: string) {
    return ['vue'].includes(lang);
  }

  onBlockLoad(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult {
    return {
      loader: 'tsx',
      contents: extractScript(args.entryPointCode),
    };
  }

  render: IDumiTechStackRenderType = {
    type: 'CANCELABLE',
    plugin: VUE_RENDERER_KEY,
  };

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const filename = !!opts.id
        ? resolve(dirname(opts.fileAbsPath), opts.id, '.vue')
        : opts.fileAbsPath;
      const id = hashId(filename);

      const compiled = compileSFC({ id, filename, code: raw });
      if (Array.isArray(compiled)) {
        logger.error(compiled);
        return '';
      }
      let { js, css } = compiled;
      if (css) {
        js += `\n${COMP_IDENTIFIER}.__css__ = ${JSON.stringify(css)};`;
      }
      js += `\n${COMP_IDENTIFIER}.__id__ = "${id}";
        export default ${COMP_IDENTIFIER};`;

      // 将代码和样式整合为一段 JS 代码

      const { code } = transformDemoCode(js, {
        filename,
        parserConfig: {
          syntax: 'ecmascript',
        },
      });
      return `(async function() {
        ${code}
      })()`;
    }
    return raw;
  }
}
```

其实现分成三个部分：

### transformCode: 编译转换 Internal Demo

主要采用官方的`@vue/compiler-sfc`进行编译，`.vue`文件会被转换为 JS 和 CSS 代码，我们将两者封装为一个完整的 ES module。最后利用 `dumi/tech-stack-utils` 提供的`transformDemo`函数，将 ES module 转换成一个 IIFE 表达式（**代码在 dumi 编译中必须以一个 JS 表达式的方式存在**）。

### render: 确定组件在 React 中的渲染方式

```ts
render: IDumiTechStackRenderType = {
  type: 'CANCELABLE',
  plugin: VUE_RENDERER_KEY,
};
```

这里指定了 Vue 组件需要实现`cancelable`函数，而该函数则需要通过 Dumi RuntimePlugin 将其注入到 React 框架中。

一个典型的`cancelable`函数如下：

```ts
// render.tpl
import { createApp } from 'vue';

export async function {{{pluginKey}}} ({ canvas, component }) {
  if (component.__css__) {
    setTimeout(() => {
      document
        .querySelectorAll(`style[css-${component.__id__}]`)
        .forEach((el) => el.remove());
      document.head.insertAdjacentHTML(
        'beforeend',
        `<style css-${component.__id__}>${component.__css__}</style>`,
      );
    }, 1);
  }
  const app = createApp(component);

  app.config.errorHandler = (e) => console.error(e);
  app.mount(canvas);
  return () => {
    app.unmount();
  };
}
```

其主要实现 Vue 应用的创建及挂载，并返回 Vue 应用的销毁方法。

之后将该代码注入运行时：

```ts
// generate vue render code
api.onGenerateFiles(() => {
  api.writeTmpFile({
    path: 'index.ts',
    tplPath: join(tplPath, 'render.tpl'),
    context: {
      pluginKey: VUE_RENDERER_KEY,
    },
  });
});

api.addRuntimePluginKey(() => [VUE_RENDERER_KEY]);
api.addRuntimePlugin(() =>
  winPath(join(api.paths.absTmpPath, `plugin-${api.plugin.key}`, 'index.ts')),
);
```

dumi 运行时就会通过`VUE_RENDERER_KEY`执行相应的`cancelable`函数。

### onBlockLoad: 模块加载

dumi 默认只能对`js`,`jsx`,`ts`,`tsx`文件进行依赖分析并生成相关 asset，对于`.vue`文件则束手无策。我们可以通过`onBlockLoad`来接管默认的加载方式，主要目标是将`.vue`文件中的 script 代码提取出来方便 dumi 进行依赖分析：

```ts
onBlockLoad(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult {
    return {
      loader: 'tsx', // 将提取出的内容视为tsx模块
      contents: extractScript(args.entryPointCode),
    };
  }

```

其中`extractScript`是`dumi/tech-stack-utils`提供的函数用以提取类 html 文件中的所有 script 代码。

`IDumiTechStack`接口实现之后，我们还需要通过 registerTechStack 注册 Vue SFC

```ts
api.register({
  key: 'registerTechStack',
  stage: 1,
  fn: () => new VueSfcTechStack(),
});
```

之后就要考虑 External Demo 的编译及 API Table 的支持了：

## External Demo 编译支持

添加对 External Demo 的编译及打包支持，这需要我们对 Webpack 进行配置，由于 dumi 本身是 react 框架，所以不能粗暴地移除对 react 的支持，而是需要将 react 相关配置限定在`.dumi`中。

## API Table 支持

API Table 的支持主要在于对框架元信息信息的提取，例如针对 Vue 组件，dumi 就提供了`@dumijs/vue-meta`包来提取元数据。其他框架也要实现相关的元数据提取，主流框架基本都有相应的元数据提取包，但需要注意的是，开发者需要适配到 dumi 的元数据 schema。

在实现元数据提取之后，还需要实现 dumi 的元数据解析架构，即将数据的提取放在子线程中。dumi 也提供了相关的 API 简化实现：

**子线程侧**，我们需要实现一个元数据 Parser，这里需要实现`LanguageMetaParser`接口

```ts
import { LanguageMetaParser, PatchFile } from 'dumi';

class VueMetaParser implements LanguageMetaParser {
  async patch(file: PatchFile) {
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
  BaseApiParserOptions,
  LanguageMetaParser,
  PatchFile,
  createApiParser,
} from 'dumi';

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
