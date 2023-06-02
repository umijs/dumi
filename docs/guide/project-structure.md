---
nav: 指南
group: 基础
order: 1
---

# 目录结构

## 基础结构

如果你是通过 `create-dumi` 创建的 React 脚手架（`React` 选项），那么生成的目录结构大致如下：

<Tree>
  <ul>
    <li>
      docs
      <small>组件库文档目录</small>
      <ul>
        <li>
          index.md
          <small>组件库文档首页</small>
        </li>
        <li>
          guide.md
          <small>组件库其他文档路由（示意）</small>
        </li>
      </ul>
    </li>
    <li>
      src
      <small>组件库源码目录</small>
      <ul>
        <li>
          Foo
          <small>单个组件</small>
          <ul>
            <li>
              index.tsx
              <small>组件源码</small>
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
      .dumirc.ts
      <small>dumi 的配置文件</small>
    </li>
    <li>
      .fatherrc.ts
      <small>father 的配置文件，用于组件库打包</small>
    </li>
  </ul>
</Tree>

如果你创建的是静态站点（`Static Site` 选项），那么忽略上面的 `src` 目录结构即可。

## 其他目录约定

:::warning
这些约定仅作用于组件库文档，不会对组件库源码构建产生任何影响，请勿基于这些约定来实现特定的组件库功能（比如为组件库添加全局样式）。
:::

### 全局样式

约定如下两个路径为文档添加全局样式：

1. 创建 `.dumi/global.(less|sass|scss|css)`：适用于单纯的全局样式新增
2. 创建 `.dumi/overrides.(less|sass|scss|css)`：适用于覆盖 dumi 默认主题或三方主题包的样式，该文件中的规则会自动提升一层优先级确保覆盖生效

### 全局脚本

约定 `.dumi/global.(js|jsx|ts|tsx)` 为全局脚本文件，适用于要在全局添加自定义逻辑的场景（比如监控运行时错误并上报）。

### 运行时配置

约定 `.dumi/app.(js|jsx|ts|tsx)` 为运行时配置文件，适用于修改框架[运行时配置](../config/runtime.md)的场景。

### 加载组件

约定 `.dumi/loading.(js|jsx|ts|tsx)` 为全局 loading 组件；dumi 2 默认按路由对产物拆包，切换页面时需要等待异步 chunk 加载完成后才能呈现，可通过该组件来为用户展示自定义加载动画。

### 404 页面

约定 `.dumi/pages/404.(js|jsx|ts|tsx)` 为自定义 404 页面。

### favicon

约定 `.dumi/favicon.(ico|gif|png|jpg|jpeg|svg|avif|webp)` 为站点 favicon 图标，当存在任一后缀文件时，dumi 将会自动在 HTML 中插入对应的 `link` 标签以应用 favicon；你也可以通过 [favicons](../config/index.md#favicons) 配置项来手动指定 favicon。

### 临时文件目录

约定 `.dumi/tmp*` 为框架的临时文件，这些文件由 dumi 在编译过程中自动生成，**请勿直接修改或在代码中引入它们**。
