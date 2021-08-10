---
title: 基础使用
order: 2
toc: menu
---

## 目录结构

### 普通项目

一个普通的、使用 dumi 做研发的组件库目录结构大致如下：

<Tree>
  <ul>
    <li>
      docs
      <small>组件库文档目录</small>
      <ul>
        <li>
          index.md
          <small>组件库文档首页（如果不存在，会 fallback 到 README.md）</small>
        </li>
        <li>
          guide
          <small>组件库文档其他路由（示意）</small>
          <ul>
            <li>index.md</li>
            <li>sample.md</li>
            <li>help.md</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>
      src
      <small>组件库源码目录</small>
      <ul>
        <li>
          Button
          <small>单个组件</small>
          <ul>
            <li>
              index.tsx
              <small>组件源码</small>
            </li>
            <li>
              index.less
              <small>组件样式</small>
            </li>
            <li>
              index.md
              <small>组件文档</small>
            </li>
          </ul>
        </li>
        <li>
          index.ts
          <small>组件库入口文件</small>
        </li>
      </ul>
    </li>
    <li>
      .umirc.ts
      <small>dumi 配置文件（也可以是 config/config.ts）</small>
    </li>
    <li>
      .fatherrc.ts
      <small>father-build 的配置文件，用于组件库打包</small>
    </li>
  </ul>
</Tree>

如果是单纯的文档站点、不包含组件源码，忽略上面的 `src` 目录结构即可。

注意，此处仅对目录结构做说明，如果要初始化一个 dumi 项目，建议直接使用 `@umijs/create-dumi-lib` 或 `@umijs/create-dumi-app` 的脚手架进行创建。

### lerna 项目

大多数情况下，我们会将所有 lerna 子包的文档集中在同一个文档站点中，目录结构通常是这样的：

<Tree>
  <ul>
    <li>
      docs
      <small>仓库公共文档</small>
      <ul>
        <li>
          index.md
          <small>组件库文档首页（如果不存在，会 fallback 到 README.md）</small>
        </li>
        <li>
          guide
          <small>组件库文档其他路由（示意）</small>
          <ul>
            <li>index.md</li>
            <li>sample.md</li>
            <li>help.md</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>
      packages
      <ul>
        <li>
          a
          <small>子包 a</small>
          <ul>
            <li>
              src
              <small>子包 a 的源码目录</small>
              <ul>
                <li>
                  Button
                  <small>单个组件</small>
                  <ul>
                    <li>
                      index.tsx
                      <small>组件源码</small>
                    </li>
                    <li>
                      index.less
                      <small>组件样式</small>
                    </li>
                    <li>
                      index.md
                      <small>组件文档</small>
                    </li>
                  </ul>
                </li>
                <li>
                  index.ts
                  <small>组件库入口文件</small>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          b
          <small>子包 b</small>
          <ul>
            <li>
              src
              <small>子包 b 的源码目录</small>
              <ul>
                <li>
                  Table
                  <small>单个组件</small>
                  <ul>
                    <li>
                      index.tsx
                      <small>组件源码</small>
                    </li>
                    <li>
                      index.less
                      <small>组件样式</small>
                    </li>
                    <li>
                      index.md
                      <small>组件文档</small>
                    </li>
                  </ul>
                </li>
                <li>
                  index.ts
                  <small>组件库入口文件</small>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li>
      .umirc.ts
      <small>dumi 配置文件（也可以是 config/config.ts）</small>
    </li>
    <li>
      .fatherrc.ts
      <small>father-build 的配置文件，用于组件库打包</small>
    </li>
  </ul>
</Tree>

dumi 默认会以 `packages/[包名]/src` 为基础路径搜寻所有子包的 Markdown 文档并生成路由，目前没有 lerna 项目的脚手架，可以查看 [ahooks](https://github.com/alibaba/hooks) 项目作为参考。

## 约定式路由

如下图所示，dumi 的约定式路由规则非常简单：

<img src="https://gw.alipayobjects.com/zos/bmw-prod/e607ec1b-8f5d-4fec-9557-42298ceab02e/kiimo7of_w1410_h548.png" width="705" />

举几个例子方便理解：

| 磁盘路径/模式 | doc 模式 | site 模式 |
| --- | --- | --- |
| /path/to/src/index.md | - 分组：无<br >- 页面路由：/ | - 导航：无<br >- 分组：无<br>- 页面路由：/ |
| /path/to/src/hello.md | - 分组：无<br >- 页面路由：/hello | - 导航：/hello<br >- 分组：/hello<br>- 页面路由：/hello |
| /path/to/src/hello/index.md | - 分组：/hello<br >- 页面路由：/hello | - 导航：/hello<br >- 分组：/hello<br>- 页面路由：/hello |
| /path/to/src/hello/world.md | - 分组：/hello<br >- 页面路由：/hello/world | - 导航：/hello<br >- 分组：/hello<br>- 页面路由：/hello/world |
| /path/to/src/hello/world/dumi.md | - 分组：/hello/world<br >- 页面路由：/hello/world/dumi | - 导航：/hello<br >- 分组：/hello/world<br>- 页面路由：/hello/world/dumi |

需要注意的是，**多个基础路径下相同磁盘路径的文件生成的路由会相互冲突**，这意味着在默认配置下 `docs/index.md` 和 `src/index.md` 只有其中 1 个会被识别。

### 自定义导航、分组和标题

如果希望控制导航/分组/页面标题的生成，可以通过**在 Markdown 文件顶部**编写 FrontMatter 实现：

```markdown
---
title: 自定义页面名称
nav:
  path: /自定义导航路由
  title: 自定义导航名称
  order: 控制导航顺序，数字越小越靠前，默认以路径长度和字典序排序
group:
  path: /自定义分组路由，注意，分组路由 = 导航路由 + 自己
  title: 自定义分组名称
  order: 控制分组顺序，数字越小越靠前，默认以路径长度和字典序排序
---

<!-- 其他 Markdown 内容 -->
```

在 site 模式下，我们也可以通过配置项对导航和左侧菜单进行增量自定义，请参考 [配置项 - navs](/zh-CN/config#navs) 以及 [配置项 - menus](/zh-CN/config#menus)。

## 写组件 demo

dumi 提供了两种编写 demo 的方式，分别应对不同的场景。

### 代码块

如果我们的 demo 非常轻量，建议直接编写代码块，比如：

<pre lang="markdown">
```jsx
import React from 'react';

export default () => <h1>Hello dumi!</h1>;
```
</pre>

`jsx` 和 `tsx` 的代码块将会被 dumi 解析为 React 组件，以上代码块将会被渲染成：

```jsx
import React from 'react';

export default () => <h1>Hello dumi!</h1>;
```

但是在 markdown 代码块中编写代码会失去类型提示和校验，不能像直接在 `tsx` 中那样丝滑，因此我们推荐使用 VSCode 插件 [TS in Markdown](https://github.com/Dali-Team/vscode-ts-in-markdown)。

#### 在 demo 中引入组件

dumi 有一个非常重要的原则——**开发者应该像用户一样使用组件**。

如何理解？假设我们正在研发的组件库 NPM 包名叫做 `hello-dumi`，我们正在为其中的 `Button` 组件编写 demo，下面列举出引入组件的正确方式及错误示例：

```jsx | pure
// 正确示例
import { Button } from 'hello-dumi';

// 错误示例，用户不知道 Button 组件是哪里来的
import Button from './index.tsx';
import Button from '@/Button/index.tsx';
```

当我们的每个 demo 都秉持这一原则时，意味着我们写出的 demo，不仅可以用来调试组件、编写文档，还能被用户直接拷贝到项目中使用。

也许你会有疑问，研发阶段的组件库源代码尚未发布成 NPM 包，怎么才能成功引入组件？无需担心，dumi 会为我们自动建立组件库 NPM 包 -> 组件库源代码的映射关系，即便是 lerna 仓库，也会为每个子包都建立好映射关系。

#### 不渲染代码块

如果我们希望某段 `jsx`/`tsx` 代码块被渲染为源代码，可以使用 `pure` 修饰符告诉 dumi：

<pre lang="markdown">
```jsx | pure
// 我不会被渲染为 React 组件
```
</pre>

相似地，我们可以搭配 [配置项 - resolve.passivePreview](/zh-CN/config#passivepreview) 和 `preview` 修饰符来开启代码块的被动渲染模式，该模式用于仅将具有 `preview` 修饰符的 `jsx`/`tsx` 代码块渲染为 React 组件，而不再是全部 `jsx`/`tsx` 代码块。该方案一般用于避免给过多的 `jsx`/`tsx` 代码块手动添加 `pure` 修饰符。

<pre lang="markdown">
```jsx | preview
// 我会被渲染为 React 组件
```
```jsx
// 在默认情况下，我会被渲染为 React 组件
// 在开启代码块被动渲染的情况下，我不会被主动渲染为 React 组件，除非添加 preview 修饰符
```
</pre>

### 外部 demo

如果我们的 demo 非常复杂，甚至可能有很多外部文件，那么建议使用外部 demo：

```markdown
<code src="/path/to/complex-demo.tsx"></code>
```

和代码块 demo 一样，上述代码也会被渲染为 React 组件，并且外部 demo 的源代码及其他依赖的源代码都可以被用户查看，就像这样：

<code src="../.demos/modal/modal.jsx"></code>

### 控制 demo 渲染

dumi 提供了一些 FrontMatter 属性，以满足不同的 demo 渲染需求，在**源代码顶部**配置即可：

<pre lang="markdown">
```jsx
/**
 * [配置项名称]: [值]
 */
```
</pre>

对于外部 demo，这些 FrontMatter 属性除了写在源代码里，也可以写在 `code` 标签的属性上：

```html
<code src="/path/to/demo" 配置项="值"></code>
```

dumi 目前支持如下 demo 控制能力。

#### 捕获 `fixed` 元素

设置 `transform` 为 `true`，可使得内部 `position: fixed;` 元素相对于 Demo 包裹器定位：

```jsx
/**
 * transform: true
 * defaultShowCode: true
 */
/**
 * transform: true
 */

import React from 'react';

export default () => <h1 style={{ position: 'fixed', top: 0, left: 0 }}>我不会飞出去</h1>;
```

#### 修改背景色

通过 `background` 配置项，可以修改它的背景颜色、渐变甚至加上背景图片，dumi 会将其当做 CSS 属性值处理，比如配置 `background` 为 `'#f6f7f9'`：

```jsx
/**
 * background: '#f6f7f9'
 * defaultShowCode: true
 */
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```

#### 不需要内边距

配置 `compact` 为 `true`，则会移除所有内边距：

```jsx
/**
 * compact: true
 * defaultShowCode: true
 */
/**
 * compact: true
 */

import React from 'react';

export default () => '我会贴边站';
```

#### 标题与简介

通过 `title` 和 `desc` 配置 demo 的标题和简介：

```jsx
/**
 * title: 我是标题
 * desc: 我是简介，我可以用 `Markdown` 来编写
 * defaultShowCode: true
 */
/**
 * title: 我是标题
 * desc: 我是简介，我可以用 `Markdown` 来编写
 */

import React from 'react';

export default () => null;
```

#### 直接嵌入文档

配置 `inline` 为 `true` 则不会展示包裹器、直接在文档里嵌入 demo：

<pre lang="markdown">
```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => '我会被直接嵌入';
```
</pre>

就像这样：

```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => '我会被直接嵌入';
```

#### 调试型 demo

设置 `debug` 为 true，则该 demo 仅在开发环境下展示、且会有一个特殊标记：

```jsx
/**
 * inline: true
 */
import React from 'react';
import Previewer from 'dumi-theme-default/src/builtins/Previewer';

export default () => (
  <Previewer
    sources={{
      _: {
        jsx:
          "/**\n * debug: true\n */\n\nimport React from 'react';\n\nexport default () => '我仅在开发环境下展示';",
      },
    }}
    dependencies={{}}
    debug
    defaultShowCode
  >
    我仅在开发环境下展示
  </Previewer>
);
```

#### iframe 模式

设置 `iframe` 为 `true`，将会使用 `iframe` 渲染 demo，可实现和文档的完全隔离，通常用于布局型组件，此时 [`compact`](/zh-CN/config/frontmatter#compact) 配置默认为 `true`：

```jsx
/**
 * iframe: 150
 * defaultShowCode: true
 */
/**
 * iframe: true // 设置为数值可控制 iframe 高度
 */
import React from 'react';

export default () => (
  <h2 style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.1)', padding: '5px 20px' }}>iframe 模式</h2>
);
```

## 使用内置组件

dumi 提供了一系列内置组件作为 Markdown 语法的补充，除了上面我们已经用到过的 `code` 以外，还支持这些：

### Alert

使用 `Alert` 创建一个提示框，`type` 可选 `warning`、`info`、`success`、`error`，默认为 `info`。

```html
<Alert type="info">
  注意，内部暂时只能编写 HTML
</Alert>
```

<Alert type="info">
  注意，内部暂时只能编写 HTML
</Alert>

### Badge

使用 `Badge` 可以创建一个标签：

```markdown
#### 标签测试 <Badge>Hello</Badge>
```

#### 标签测试 <Badge>Hello</Badge>

### embed

dumi 对 HTML 默认的 `embed` 标签做了扩展，可以在一个 Markdown 文档中嵌入另一个 Markdown 文档的内容：

```html
<!-- 引入全量的 Markdown 文件内容 -->
<embed src="/path/to/some.md"></embed>

<!-- 根据行号引入指定行的 Markdown 文件内容 -->
<embed src="/path/to/some.md#L1"></embed>

<!-- 根据行号引入部分 Markdown 文件内容 -->
<embed src="/path/to/some.md#L1-L10"></embed>

<!-- 根据正则引入部分 Markdown 文件内容 -->
<embed src="/path/to/some.md#RE-/^[^\r\n]+/"></embed>
```

我们也可以通过 dumi 提供的主题 API 实现内置组件的复写和新增，可访问 [主题 - 主题开发](/zh-CN/theme/development) 了解更多。
