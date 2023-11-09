---
title: 安装插件
group:
  title: 使用vue
  order: 1
order: 1
---

# 安装 Vue 支持插件

dumi 中对 Vue 的支持主要通过`@dumijs/preset-vue`插件集实现, 目前只支持 Vue3

## 安装

```bash
pnpm i -D @dumijs/preset-vue
```

## 配置

```ts
// .dumirc.ts
export default {
  presets: ['@dumijs/preset-vue'],
};
```

## 插件选项

### parserOptions

Vue 组件元数据解析选项

例如，以下配置可以使得名称为`InternalType`的类型跳过检查

```ts
// .dumirc.ts
export default {
  presets: ['@dumijs/preset-vue'],
  vue: {
    parserOptions: {
      checkerOptions: {
        schema: { ignore: ['InternalType'] },
      },
    },
  },
};
```

默认情况下，从`node_modules`中引入所有类型不会被解析，这样可以有效避免元信息冗余，你也可以通过配置`exclude`来定制化类型引入

```ts
// .dumirc.ts
export default {
  presets: ['@dumijs/preset-vue'],
  vue: {
    parserOptions: {
      checkerOptions: {
        schema: { exclude: [/node_modules/, /mylib/] },
      },
    },
  },
};
```
