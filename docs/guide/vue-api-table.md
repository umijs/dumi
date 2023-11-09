---
title: 自动 API 表格
group:
  title: 使用vue
  order: 1
order: 2
---

# Vue 的自动 API 表格

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
    parserOptions: {
      tsconfigPath: path.resolve(__dirname, './tsconfig.vue.json');
    },
  },
};

```

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

### @exposed/@expose

:::warning
组件实例的方法或是属性的暴露，必须使用@exposed/@expose 标识，单文件组件也不例外
:::

```ts
defineExpose({
  /**
   * @exposed
   */
  focus() {},
});
```

JSX/TSX 的组件方法暴露比较麻烦，需要用户另外声明

```ts
export default Button as typeof Button & {
  new (): {
    /**
     * The signature of the expose api should be obtained from here
     * @exposed
     */
    focus: () => void;
  };
};
```

### @ignore

被`@ignore`标记的属性就会被忽略，不会被解析

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

### Methods

<API id="Button" type="methods"></API>
```
