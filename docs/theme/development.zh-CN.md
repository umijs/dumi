---
order: 2
toc: menu
---

# 主题开发

开发 dumi 主题非常容易，为了应对不同的场景，dumi 提供了两种主题开发方式：

1. 在 dumi 项目根目录创建 `.dumi/theme` 文件夹，通常用于项目中的特殊自定义，不考虑复用性
2. 创建 `@group/dumi-theme-` 或 `dumi-theme-` 开头的 npm 包 ，通常用于研发完整的主题包，便于共享给其他项目使用

这两种方式之间并无隔阂，这意味着我们初期可以先走第一种方式调试主题包，待主题包稳定后单独发一个 npm 包即可。

## 目录结构

先来看一下标准的 dumi 主题包结构：

<Tree title=".dumi/theme（本地主题）或 dumi-theme-[name]/src（npm 主题包）">
  <ul>
    <li>
      builtins
      <small>内置组件文件夹，dumi 会寻找<strong>一级目录</strong>下的 <code>j|tsx</code> 进行挂载，该文件夹下的组件可直接在 md 中使用</small>
    </li>
    <li>
      components
      <small>[非约定] 主题包自身为了可维护性抽取出来的组件，文件夹名称随开发者自定义</small>
    </li>
    <li>
      style
      <small>[非约定] 主题包的样式表</small>
    </li>
    <li>
      layout.tsx
      <small>自定义的 layout 组件，props.children 即每个 md 的内容，开发者可自行控制导航、侧边栏及内容渲染</small>
    </li>
    <li>
      layouts
      <small>自定义的 layouts 目录，在需要自定义多个 layout 时使用</small>
      <ul>
        <li>
          index.tsx
          <small>等同于 src/layout.tsx，两种方式二选一，layout.tsx 优先级更高</small>
        </li>
        <li>
          demo.tsx
          <small>自定义组件 demo 单独路由（~demos/:uuid）的 layout</small>
        </li>
      </ul>
    </li>
  </ul>
</Tree>

## 增量自定义

目录结构看起来并不简单？其实上述所有内容都可以增量自定义，如果某个必要文件该主题包没有提供，则会兜底到 dumi 的默认主题，会进行兜底的文件如下：

1. `builtins/Previewer.tsx` - 渲染 demo 包裹器
2. `builtins/SourceCode.tsx` - 渲染代码块并高亮
3. `builtins/Alert.tsx` - 渲染提示框
4. `builtins/Badge.tsx` - 渲染标签
5. `layout.tsx` - 默认的全局 layout

## 自定义正文区域

如果只希望控制正文区域的渲染，可以选择包裹默认主题的 `layout`、控制 `layout` 的 `children` 来实现。例如，给正文区域增加一个反馈按钮：

```tsx | pure
// .dumi/theme/layout.tsx(本地主题) 或 src/layout.tsx(主题包)
import React from 'react';
import Layout from 'dumi-theme-default/es/layout';

export default ({ children, ...props }) => (
  <Layout {...props}>
    <>
      <button>反馈</button>
      {children}
    </>
  </Layout>
);
```

## 开发、调试及使用

所谓的主题开发，本质上还是写 React 组件，但为了降低写组件的成本，dumi 提供了一套主题 API、开放了许多 dumi 内置的能力和数据，可以帮我们快速完成主题的开发，详见 [主题 - 主题 API](/zh-CN/theme/api)。

主题开发的过程中需要不断调试。对于本地主题而言，dumi 是完全自动检测的，只要存在 `.dumi/theme` 文件夹，dumi 就会在构建时进行挂载；对于独立的主题 npm 包而言，需要将其写入 `devDependencies`，并且将该 npm 包 link 到项目下，dumi 将会自动挂载该主题，例如：

```json
{
  "dependencies": {
    "dumi-theme-default": "0.0.0"
  }
}
```

- 本地主题：使用和调试是类似的
- npm 包：用户只需要执行 `npm install dumi-theme-[name] -D` 即可完成主题包的安装，启动 dumi 时主题将会被自动挂载
