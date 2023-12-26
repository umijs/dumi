---
toc: content
group: 框架配置
---

# 运行时配置

<embed src="../.upstream/runtime-config.md#RE-/<!-- runtime config intro[^]+ runtime config intro end -->/"></embed>

## 配置项

### modifyCodeSandboxData

修改在 CodeSandbox 中打开 demo 的数据，比如修改依赖、增加文件等。

```js
export function modifyCodeSandboxData(memo, props) {
  // 根据需要修改 memo 并返回新值
  return memo;
}
```

入参：

- `memo`：基于 demo 元数据自动生成的 CodeSandbox 数据，该数据会在序列化以后发往 CodeSandbox，你可以根据需要加工该数据
- `props`：当前 demo 所属预览器的 props，包含原始的 demo 元数据和预览配置，可作为加工 `memo` 的辅助信息

出参：必须为 CodeSandbox utils 支持的数据结构，可参考 [CodeSandbox 相关源码](https://github.com/codesandbox/codesandbox-importers/blob/7e0445c7ac833fbffd20bcb3c49c1d0af364ddea/packages/import-utils/src/api/define.ts#L18-L23)

### modifyStackBlitzData

修改在 StackBlitz 中打开 demo 的数据，比如修改依赖、增加文件等。

```js
export function modifyStackBlitzData(memo, props) {
  // 根据需要修改 memo 并返回新值
  return memo;
}
```

入参：

- `memo`：基于 demo 元数据自动生成的 StackBlitz 数据，该数据会由 StackBlitz SDK 发送给 StackBlitz 平台，你可以根据需要加工该数据
- `props`：当前 demo 所属预览器的 props，包含原始的 demo 元数据和预览配置，可作为加工 `memo` 的辅助信息

出参：必须为 StackBlitz SDK 支持的数据结构，可参考 [StackBlitz SDK 文档](https://developer.stackblitz.com/platform/api/javascript-sdk#openproject)

<embed src="../.upstream/runtime-config.md#RE-/<!-- runtime config core[^]+ runtime config core end -->/"></embed>

<embed src="../.upstream/runtime-config.md#RE-/### render[^#]+/"></embed>

<embed src="../.upstream/runtime-config.md#RE-/### rootContainer[^#]+/"></embed>
