---
nav:
  order: -1
demo:
  cols: 2
---

# 指南

## 开始之前

dumi 目前尚处于 beta 阶段，预计近 1 个月后会推进到 RC 阶段。beta 意味着提供的功能尚处于测试阶段，可能（大概率）存在 Bug，且新功能也会持续增加，所以 dumi 的 beta 版本可能适用于如下场景：

1. 有正准备研发的组件库文档、静态站点，且 1 个月内不计划发布生产版本
2. 对 dumi 2 有兴趣，单纯地希望体验一下新版
3. 对 dumi 2 的实现有兴趣，希望体验并参与到 dumi 2 的研发或功能验证中
4. 对 dumi 2 的主题系统有兴趣，希望抢先创建 dumi 2 的主题包（近期会提供主题包研发脚手架）

关于目前 beta 版提供的功能及尚未支持的功能，可以在 [首页](/) 查看。

## 快速上手

由于使用方式尚未稳定，暂不提供脚手架，可以参考以下步骤手动初始化：

```bash
# 初始化 NPM 项目
$ mkdir dumi-2-example
$ cd dumi-2-example
$ npm init -y

# 安装 dumi
$ npm i dumi@beta -D

# 创建普通文档
$ mkdir docs && touch docs/index.md

# 创建组件文档
$ mkdir -p src/Foo && touch src/Foo/index.md

# 启动 dumi
$ npx dumi dev
```

然后编辑 `docs/index.md` 和 `src/Foo/index.md` 文件，即可看到预览效果。

Demo 的编写方式与 dumi 1 一致，通过代码块或 `code` 标签即可在 Markdown 中渲染 React demo，比如：

<pre><code className="language-md">
代码块 demo：

```jsx
import React from 'react';

export default () =&gt; &lt;&gt;Hello world!&lt;/&gt;;
```

code 标签引入外部 demo：

&lt;code src="./demos/hello.tsx"&gt;&lt;/code&gt;
</code></pre>

将会被渲染为：

```jsx
import React from 'react';

export default () => <>Hello world!</>;
```

多个 demo 也可以通过 [Markdown 的 `demo.cols` 配置项](/config/markdown#cols) 进行分栏：

<code src="./demos/cols.tsx" description="编写 demo 描述">分栏 1</code>
<code src="./demos/cols.tsx">分栏 2</code>
<code src="./demos/cols.tsx">分栏 3</code>
<code src="./demos/cols.tsx">分栏 4</code>

更多框架配置及 Demo 渲染的选项，请访问配置项文档：[配置项](/config)。

## 问题反馈

由于 dumi 2.0 尚不问题，如果在试用过程中发现任何问题、或者有改善建议，欢迎在 GitHub 讨论区进行反馈：<br />https://github.com/umijs/dumi/discussions/1216
