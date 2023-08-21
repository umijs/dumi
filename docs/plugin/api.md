---
group: 开发
order: 1
---

# 插件 API

<embed src="../.upstream/plugin-api.md#RE-/<!-- core api[^]+ core api end -->/"></embed>

## 重点方法

### addContentTab

增加页面 Tab，关于页面 Tab 的介绍可查看 [指南 - 页面 Tab](/guide/page-tab)。

```ts
api.addContentTab(() => ({
  /**
   * tab key，也会作为 URL 的 query 参数值
   */
  key: 'playground';
  /**
   * id，用于区分多个 tab，仅在自动 id 冲突时需要配置
   */
  id?: string;
  /**
   * 生效路由的正则，匹配的路由才会应用该 Tab，未配置时则对所有路由生效
   */
  test?: /\/components\//;
  /**
   * 用于自定义 tab 名称
   */
  title?: string;
  /**
   * tab 名称文案国际化，通过传入国际化文案 key 来实现。优先级高于 title 配置项
   * 可通过 api.modifyTheme 来配置国际化文案 key 对应的文案
   */
  titleIntlId?: string;
  /**
   * 页面 Tab 的 React 组件
   */
  component: require.resolve('/path/to/tab.tsx');
}));
```

### getAssetsMetadata

获取当前项目的资产元数据，通常配合其他插件钩子使用。

```ts
api.onBuildComplete(async () => {
  const data = await api.getAssetsMetadata();

  // do something
});
```

### modifyAssetsMetadata

修改当前项目的资产元数据。执行 `dumi build --assets` 时会产出资产元数据文件 `assets.json`，通过该 API 可对这份数据文件进行修改。

```ts
api.modifyAssetsMetadata((data) => {
  // 覆盖默认的组件库产品名称
  data.name = 'Ant Design';

  return data;
});
```

### modifyTheme

修改主题解析结果。

```ts
api.modifyTheme((memo) => {
  // 修改国际化文案
  console.log(memo.locales);
  // 修改全局组件
  console.log(memo.builtins);
  // 修改插槽
  console.log(memo.slots);
  // 修改 GlobalLayout/DocLayout/DemoLayout
  console.log(memo.layouts);

  return memo;
});
```

:::warning
需要注意的是，该 API 的修改结果仍会被本地主题覆盖，因为本地主题的优先级最高。
:::

### registerTechStack

注册其他技术栈，用于扩展 Vue.js、小程序等技术栈的 demo 编译能力，可参考内置的 [React 技术栈](https://github.com/umijs/dumi/tree/master/src/techStacks/react.ts) 实现。dumi 官方的 Vue.js 编译方案正在研发中，敬请期待。

```ts
// CustomTechStack.ts
import type { ITechStack } from 'dumi';

class CustomTechStack implements IDumiTechStack {
  /**
   * 技术栈名称，确保唯一
   */
  name = 'custom';
  /**
   * 是否支持编译改节点，返回 true 的话才会调用后续方法
   */
  isSupported(node: hastElement, lang: string) {
    return lang === 'jsx';
  }
  /**
   * 代码转换函数，返回值必须是 React 组件代码字符串
   * @note  https://github.com/umijs/dumi/tree/master/src/types.ts#L57
   */
  transformCode(raw: string, opts) {
    // do something
    return 'function Demo() { return ... }';
  }
  /**
   * 生成 demo 资产元数据（可选，通常仅在 dumi 无法分析出元数据时使用，例如非 JS 模块）
   * @note  https://github.com/umijs/dumi/tree/master/src/types.ts#L64
   */
  generateMetadata(asset: ExampleBlockAsset) {
    // do something
    return asset;
  }
  /**
   * 生成 demo 预览器的组件属性，在需要覆盖默认属性时使用
   * @note  https://github.com/umijs/dumi/tree/master/src/types.ts#L70
   */
  generatePreviewerProps(props: IPreviewerProps, opts) {
    // do something
    return props;
  }
}

// plugin.ts
api.registerTechStack(() => new CustomTechStack());
```

<embed src="../.upstream/plugin-api.md#RE-/<!-- methods[^]+ props end -->/"></embed>
