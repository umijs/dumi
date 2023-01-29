---
group: 开发
---

# 创建全局组件

:::info
如果你还不了解 dumi 的主题系统是如何工作的，请先阅读 [如何工作](./index.md)。
:::

Markdown 语法虽然很强大，但可支持的表现形式仍然是有限的，而全局组件能让我们拓展更多的表现形式，使得文档的体验及可维护性都变得更好。

## 基础示例

假设我们需要创建一个 `Foo` 组件，它的作用就是为我们展示 `barValue` 属性。首先创建文件：

```bash
# 在本地主题中
$ mkdir -p .dumi/theme/builtins
$ touch .dumi/theme/builtins/Foo.tsx

# 在主题包中
$ touch src/builtins/Foo.tsx
```

然后编辑它：

```tsx | pure
// Foo.tsx
import React, { type FC } from 'react';

const Foo: FC<{ barValue: string }> = (props) => (
  <h1>当前 barValue 属性值为：{props.barValue}</h1>
);

export default Foo;
```

最后在 Markdown 文件中使用即可：

```markdown
<!-- docs/some.md -->

<Foo barValue="Big Bar!"></Foo>
```

当我们执行 `dumi dev` 后，将会看到：

```jsx | inline
import React from 'react';

export default () => <h1>当前 barValue 属性值为：Big Bar!</h1>;
```

此时，我们就完成了一个最基础的全局组件，它可以在任意 Markdown 里被重复使用！

## 实践与限制

细心的朋友可能已经发现了，在基础示例中体现了如下限制：

1. **必须使用双标签**：习惯使用 JSX 的开发者会很自然地自闭合空标签，但 Markdown 支持的是 HTML 而不是 JSX，自闭合会导致 DOM 树闭合关系出现异常，在 GitHub 之类的预览页面更是会出现错乱，所以 dumi 2 不再支持用自闭合标签使用全局组件
2. **属性只能是字符串**：不同于 JSX Properties，HTML 属性能表达的只能是字符串，dumi 不希望破坏规范，所以 dumi 2 不再自动对 JSON 数据做转换

如果我们希望传递复杂数据，dumi 建议使用 HTML 子节点来传递，这样能在 GitHub 预览页面保持较好的降级预览效果。

例如我们希望提供一组卡片墙，可以这么写：

```markdown
<Cards>
  <ul>
    <li data-cover="https://www.example.com/cover_1.png">卡片 1</li>
    <li data-cover="https://www.example.com/cover_2.png">卡片 2</li>
    <li data-cover="https://www.example.com/cover_3.png">卡片 3</li>
    <li data-cover="https://www.example.com/cover_4.png">卡片 4</li>
  </ul>
</Cards>
```

在 `Card` 组件的代码中，读取 `props.children` 再转换为需要的数据结构即可，这样哪怕是在 GitHub 预览页面中，用户也能降级预览纯文本列表而不是一片空白：

<ul>
  <li data-cover="https://www.example.com/cover_1.png">卡片 1</li>
  <li data-cover="https://www.example.com/cover_2.png">卡片 2</li>
  <li data-cover="https://www.example.com/cover_3.png">卡片 3</li>
  <li data-cover="https://www.example.com/cover_4.png">卡片 4</li>
</ul>
