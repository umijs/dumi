---
title: 添加技术栈
group: 开发
order: 1
---

# 添加技术栈

为 dumi 开发添加一个技术栈插件，需要实现以下功能，以添加 Vue 框架支持为例

### 实现非外部 Demo 代码的编译转换

该功能主要通过插件 API `api.registerTechStack` 实现，在 Vue 框架支持中，主要利用该 API 实现对 JSX/SFC 两种组件代码的转换，这里主要讲单文件组件(SFC)的转换：

对于一个`.vue`文件，可以采用官方的`@vue/compiler-sfc`进行编译，除了对于`template`及`script`的处理，还有对`style`的处理，最终我们需要将代码和样式统统整合为一段 JS 代码，并通过 dumi 提供的`babel-plugin-iife`插件，将模块代码包装成一个 IIFE 执行表达式交给 dumi。

### 生成运行时执行代码

不同框架在浏览器中运行时也各有不同，所以需要实现一下 API 供 dumi 在运行时调用

```ts
export interface ITechStackRuntimeApi {
  techStackName: string;
  // CodeSandbox 预览实现
  openCodeSandbox?: (props: IPreviewerProps) => void;
  // StackBlitz 预览实现
  openStackBlitz?: (props: IPreviewerProps) => void;
  // 组件挂载DOM节点实现
  renderToCanvas?: (canvas: Element, component: any) => Promise<() => void>;
}
```

dumi 内部会通过`useTechStackRuntimeApi`去调用相关代码，但对于插件开发者则需要对这些方法进行实现：

以`renderToCanvas`为例，`component`其实就是 SFC 转换好的 JS 代码，我们不仅需要挂载样式，Vue 应用实例，还需要在最后提供一个应用销毁的方法

```ts
export async function renderToCanvas(canvas: Element, component: any) {
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

  globalInject(app);

  app.config.errorHandler = (e) => console.error(e);
  app.mount(canvas);
  return () => {
    app.unmount();
  };
}
```

在实现这些方法之后，则可以利用`api.addRuntimePlugin`, `onGenerateFiles` 将方法注入到 dumi 运行时中

```ts
// runtime.tsx
import { TechStackRuntimeContext } from 'dumi';
const vueTechStackRuntimeApi = {
  techStackName: 'vue3',
  openCodeSandbox,
  openStackBlitz,
  renderToCanvas,
};

export function rootContainer(container: React.ReactNode) {
  return (
    <TechStackRuntimeContext.Provider value={vueTechStackRuntimeApi}>
      {container}
    </TechStackRuntimeContext.Provider>
  );
}
```

### 模块的解析

dumi 默认只能对`js`,`jsx`,`ts`,`tsx`文件进行依赖分析并生成相关 asset，对于`.vue`文件则束手无策。不过 dumi 提供`resolveDemoModule`选项来对文件进行处理，以`.vue`为例，可以这样配置

```ts
api.modifyConfig((memo) => {
  memo.resolveDemoModule = {
    '.vue': { loader: 'tsx', transform: 'html' },
  };
  return memo;
});
```

我们将`.vue`文件当做 html 处理，dumi 会抽取其所有 script 标签里的 js 代码，最后将其作为`tsx`进行依赖分析。

### webpack 配置

添加对外部 Demo 的编译及打包支持，这需要我们对 webpack 进行配置，由于 dumi 本身是 react 框架，所以不能粗暴地移除对 react 的支持，而是需要将 react 相关配置限定在`.dumi`中。

### API Table 支持

API Table 的支持主要在于对框架元信息信息的提取，例如针对 Vue 组件，dumi 就提供了`dumi-vue-meta`包来提取元数据。其他框架也要实现相关的元数据提取，主流框架基本都有相应的元数据提取包，但需要注意的是，开发者需要适配到 dumi 的元数据 schema。

在实现元数据提取之后，还需要实现 dumi 的元数据解析架构，即将数据的提取放在子线程中。dumi 也提供了相关的 API 简化实现：

**子线程侧**，我们需要实现一个元数据 Parser，这里需要实现`LanguageMetaParser`接口

```ts
import { LanguageMetaParser } from 'dumi';

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

之后我们需要将该类转换为在子线程执行的类，dumi 同样提供了`createRemoteClass`方法

```ts
import { createRemoteClass } from 'dumi';

export const RemoteVueMetaParser = createRemoteClass(__filename, VueMetaParser);
```

注意把这个语句和`LanguageMetaParser`实现放在一起，`__filename`表示将当前文件传入子线程中执行

**主线程侧**，除了将子线程端的`Parser`传入，只需要处理文件更改

```ts
import { BaseAtomAssetsParser } from 'dumi';
export function createVueAtomAssetsParser(opts: VueParserOptions) {
  return new BaseAtomAssetsParser<VueMetaParser>({
    ...opts,
    // 将子线程端的parser传入
    parser: new RemoteVueMetaParser(opts),
    handleWatcher(watcher, { parse, patch, watchArgs }) {
      return watcher.on('all', (ev, file) => {
        if (
          ['add', 'change', 'unlink'].includes(ev) && // 侦测js/jsx/tsx/ts/vue文件的添加或是修改
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
  });
}
```

最终，需要一个返回`BaseAtomAssetsParser`实例的函数，或是一个扩展自`BaseAtomAssetsParser`的类

```ts
export class ReactAtomAssetsParser extends BaseAtomAssetsParser<ReactMetaParser> {
  constructor() {}
}
```

万事俱备，现在可以将自定义好的 Parser 交给 dumi，dumi 提供了`apiParser.customParser`选项来支持外部解析

```ts
memo.apiParser = {
  customParser: function (opts: any) {
    return createVueAtomAssetsParser({
      ...opts,
      ...options,
    });
  },
};
```

这样在实现以上五大功能后，我们就实现了 Vue 框架在 dumi 中的完整支持。照此办法，开发者也可以实现对`svelte`, `Angular`,`lit-element`等框架的支持
