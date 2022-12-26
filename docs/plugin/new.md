---
group: 开发
---

# 创建插件

如果你希望在 dumi 里使用插件，有 3 种方式：

1. 本地插件：创建 `.dumi/theme/plugin.ts` 即可，适用于对本地项目做定制，且不需要与其他项目共享的场景
2. 主题插件：在主题包内创建 `src/plugin.ts` 或 `src/plugin/index.ts`，适用于插件和主题包结合使用的场景
3. 独立插件（集）：发布到 NPM 并在 dumi 项目中通过 `plugins`/`presets` 配置启用，适用于插件（集）独立运行且希望与其他项目共享的场景

如果是创建独立插件，请在给 NPM 包命名时遵循以下原则：

1. 如果是 Umi/dumi 通用型插件，建议以 `umi-plugin-` 或 `@org/umi-plugin-` 开头命名
2. 如果是 dumi 专用插件，例如用到了 [插件 API - 重点方法](./api.md#重点方法)，或者其他 dumi 特有能力，建议以 `dumi-plugin-` 或 `@org/dumi-plugin-` 开头命名

如果是创建独立插件集，将上述命名规则中的 `plugin` 换成 `preset` 即可，例如 `dumi-preset-bar`。

## 快速上手

### 本地插件

创建 `.dumi/theme/plugin.ts` 后根据需要编写逻辑即可，不需要做任何配置，该插件文件会被 dumi 自动挂载。

### 主题插件

使用主题包脚手架初始化的项目中已经包含 `src/plugin/index.ts` 文件，根据需要编写逻辑即可，该插件文件会跟随主题包自动被加载。更多主题包开发相关内容可参考 [主题开发](../theme/index.md) 文档。

### 独立插件（集）

推荐使用 father 脚手架初始化插件项目：

```bash
$ npx create-father
```

上述命令会询问项目的目标运行平台，如果是纯 Node.js 插件，请选择『Node.js』，如果插件还包含一些浏览器端的模块，例如 React 组件，可以选择『Both』，初始化完成后根据需要编写逻辑即可。

可参考 [father - 开发](https://github.com/umijs/father/blob/master/docs/guide/dev.md) 文档了解如何实时编译插件源码并 link 到项目中做调试，link 完成后请将插件配置到测试项目的 `.dumirc.ts` 中做验证：

```ts
// .dumirc.ts
export default {
  plugins: ['dumi-plugin-bar'],
};
```
