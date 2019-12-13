---
title: 好好写 Demo
order: 8
---

# 好好写 Demo

## 原则

father-doc 奉行一个原则——**开发者应该像用户一样写 Demo**。

这句话如何理解？如果开发者写的 Demo 用户拷贝过去无法直接运行，那这个 Demo 是『只能看，不能用的』；如果开发者像用户一样写 Demo，那这个 Demo 必定是『既能看，也能用的』。

为了践行这个原则，father-doc 会为开发者自动 alias 当前项目的包，如果是 lerna 项目则会 alias 全部的包，这意味着，我们不需要再使用相对路径去引用开发的组件库了：

``` jsx | pure
import Component from '../HelloWorld'; // 不推荐写法，此行应有删除线
import Component from 'yourPackageName'; // 推荐写法，包名为 package.json 中的 name 字段
```

需要注意的是，我们必须在 `package.json` 中配置好正确的 `main`、`module` 之类的字段，同时还需要编译好源代码，alias 才能正常工作。

## 重型 Demo

在真实的场景中，Demo 往往不会像上一章展示的那样，只有短短几行；当嵌入式 Demo 数量增加、或者内容变长时，将会给维护工作带来负担；而且嵌入式 Demo 无法利用编辑器的 lint、autocomplete 等利器，Demo 编写的效率会大幅下降。

所以 father-doc 提供了从 `.md` 文件中引入外部 Demo 语法，我们可以通过 `code` 标签引入一个外部 Demo：

``` html
<code src="./HelloButton.tsx" />
```

它也能如上面的 Demo 一样被插入进文档中进行展示：

``` jsx
import React from 'react';

export default () => <button>Hello World!</button>;
```

## 自由 Demo

father-doc 作为文档编写工具只能满足一些通用场景，倘若有自定义组件的需求就会显得有心无力，所以 father-doc 提供了一种 inline 语法，能让开发者直接在 markdown 中插入任意自定义 React Component：

``` html
<code src="path/to/your/component" inline />
```

当然你也可以对嵌入式 Demo 进行 inline：

<pre>
``` jsx | inline
// your custom component here
```
</pre>

这样你的自定义 Demo 将不会被 Demo 预览器包裹，而是直接被渲染在 markdown 正文中，这意味着我们可以为自己的组件开发场景扩展任意组件！

恭喜你，已经掌握了**目前**使用 father-doc 的核心技巧，更多使用方法请参阅 <a href="#/config">配置项</a>。
