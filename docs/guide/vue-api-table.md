---
title: 自动 API 表格
group:
  title: 使用vue
  order: 1
order: 2
---

# Vue 的自动 API 表格 <Badge>实验性</Badge>

dumi 支持 Vue 组件的自动 API 表格生成，用户只需配置`entryFile`即可开始 API 表格的使用：

```ts
import { defineConfig } from 'dumi';

export default defineConfig({
  resolve: {
    // 配置入口文件路径，API 解析将从这里开始
    entryFile: './src/index.ts',
  },
});
```

## tsconfig 配置

Vue 组件的元信息提取主要使用 TypeScript 的 TypeChecker, 所以配置`tsconfig.json`时请务必将`strictNullChecks`设为`false`

```json
{
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

如果项目中一定要使用`strictNullChecks`，你也可以为 Vue 解析专门配置一个`tsconfig.vue.json`文件

```ts
// .dumirc.ts
import * as path from 'path';
export default {
  plugins: ['@dumijs/preset-vue'],
  vue: {
    tsconfigPath: path.resolve(__dirname, './tsconfig.vue.json'),
  },
};
```

:::info
若您的项目 Monorepo 项目， 默认的 tsconfigPath 为 `<project-root>/<directory>/tsconfig.json`。 `<project-root>` 为 Monorepo 项目目录； `<directory>` 则为子包`package.json` 中的 `repository.directory` 选项
:::

## checkerOptions

我们还可以通过 checkerOptions 选项来配置 Type Checker：

其中`exclude`选项默认会排除从 node_modules 中引用的所有类型，你还可以配置排除更多的目录：

```ts
export default {
  plugins: ['@dumijs/preset-vue'],
  vue: {
    checkerOptions: {
      exclude: /src\/runtime\//,
    },
  },
};
```

这样，`src/runtime/`目录下引用的所有接口都不会被检查。

还有一个比较有用的选项则是`externalSymbolLinkMappings`，可以帮助我们配置外部接口的外链，例如：

```ts
export default {
  plugins: ['@dumijs/preset-vue'],
  vue: {
    checkerOptions: {
      externalSymbolLinkMappings: {
        typescript: {
          Promise:
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
        },
      },
    },
  },
};
```

上述配置可以将 Promise 接口链接到 MDN 的参考文档。

更多关于 checkerOptions 的选项请查看： [`MetaCheckerOptions`](https://github.com/umijs/dumi/tree/master/suites/dumi-vue-meta/README.md#metacheckeroptions)

## JSDoc 编写

:::warning
推荐在 props 中定义组件的事件，这样可以获得完整的 JSDoc 支持
:::

插件主要支持以下 JSDoc 标签：

### @description

属性描述，可以在`props`, `slots`, `methods`中使用，例如：

```ts
export default defineComponent({
  props: {
    /**
     * @description 标题
     */
    title: {
      type: String,
      default: '',
    },
  },
});
```

### @default

当 prop 的`default`选项为函数时，`default`值不会被解析，这时可以使用`@default`来声明它

```ts
defineComponent({
  props: {
    /**
     * @default {}
     */
    foo: {
      default() {
        return {};
      },
    },
  },
});
```

### @component

用以区分普通函数和函数组件的。目前无法自动识别为组件的情况有两种：

```ts
/**
 * @component
 */
function InternalComponent(props: { a: string }) {
  return h('div', props.a);
}
```

```tsx | pure
/**
 * @component
 */
export const GenericComponent = defineComponent(
  <T>(props: { item: T }) => {
    return () => (<div>{item}</div>);
  },
);
```

都需要用`@component`注解，否则会被识别为函数

### API 发行相关

#### @public

#### @deprecated

#### @experimental/@beta

#### @alpha

:::warning
这些 release 标签在`defineEmits`中是无法生效
:::

对于组件实例本身暴露的方法，可以使用像`@public`这样的标签来公开

```ts
defineExpose({
  /**
   * @public
   */
  focus() {},
});
```

如果将 MetaCheckerOptions 中的`filterExposed`设置为 false，这些发布标签将全部无效。

> vue 的组件实例不仅会可以通过`expose`暴露属性和方法，还会暴露从外部传入的 props。

### @ignore/@internal

标有`@ignore`或`@internal`的属性不会被检查。

### 版本控制相关

#### @version

#### @since

## Markdown 编写

在 Markdown 文件编写时

```md
<API id="Button"></API>
```

只显示 Vue 组件的`props`部分，完整的显示应该这样编写：

```md
## Button API

### Props

<API id="Button" type="props"></API>

### Slots

<API id="Button" type="slots"></API>

### Events

<API id="Button" type="events"></API>

### Instance Methods

<API id="Button" type="imperative"></API>
```

:::info
imperative 类别是通过 release 标签暴露的组件实例方法
::::
