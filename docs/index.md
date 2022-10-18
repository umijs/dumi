---
title: dumi - 为组件研发而生的静态站点框架
hero:
  title: dumi
  description: |
    为组件研发而生的静态站点框架
    <br />
    <small style="opacity: 0.7">
      注：Beta 版尚不稳定，功能也可能会有调整，请谨慎用于正式项目
    </small>
  links:
    - title: 抢先体验
      link: /guide
    - title: GitHub
      link: https://github.com/umijs/dumi
---

目前 dumi 2 的各项特性实现情况如下，也欢迎查看 [RoadMap](https://github.com/umijs/dumi/issues/1151) 及 [TODO List](https://github.com/umijs/dumi/issues/1157) 一起参与 dumi 2 的建设：

| 核心特性          | 已支持的功能                                                                                                                                                                             | 尚未支持的功能                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 🚀 编译性能提升   | Umi 4 的 [MFSU v3 编译提速方案](https://umijs.org/blog/mfsu-faster-than-vite)<br />升级 unified 生态进行 Markdown 编译<br />使用 esbuild 进行 demo 依赖分析<br />使用 swc 进行 demo 编译 | Umi 4 的 vite 模式 <br /> Markdown 编译持久缓存 |
| 🛠 开放能力增强    | 支持自定义渲染技术栈<br />支持预览器自定义<br />支持自定义 unified 插件                                                                                                                  | 组件页 Tabs 自定义<br />提供 Vue 组件渲染方案   |
| 🚦 约定式路由增强 | 文档、实体路由设计拆分<br />约定式导航栏生成<br />约定式侧边菜单生成                                                                                                                     | --                                              |
| 🌈 主题系统增强   | [全新主题系统](https://github.com/umijs/dumi/discussions/1180)<br />支持本地主题及主题包<br />支持国际化<br />支持[多栏 demo](https://github.com/umijs/dumi/discussions/1187)<br />      | 全文搜索 API<br />主题研发脚手架                |
| 🖥 静态站点增强    | 支持配置页面级 TDK<br />内置 404 页面、支持定制                                                                                                                                          | 构建时预渲染及 HTML 静态输出                    |
| ☀️ 全新默认主题   | 基础 PC 样式                                                                                                                                                                             | 新版首页<br />响应式支持<br />内置组件支持      |
| 💎 设计系统相关   | 支持注入全局 Design Token                                                                                                                                                                | 生成资产元数据                                  |
| 💡 资产元数据 2.0 | 新版资产元数据类型定义                                                                                                                                                                   | --                                              |
| 🗞 全新集成模式    | --                                                                                                                                                                                       | 暂未实现                                        |
| 🕹 构建能力集成    | --                                                                                                                                                                                       | 暂未实现                                        |
| 🔍 应用内全文搜索 | --                                                                                                                                                                                       | 暂未实现                                        |
| 🎨 组件属性面板   | --                                                                                                                                                                                       | 暂未实现                                        |
| 🤖 自动 API 增强  | --                                                                                                                                                                                       | 暂未实现                                        |

<p style="color: #666; text-align: center; padding: 48px 0;">
  Open-source MIT Licensed | Copyright © 2019-present
  <br />
  Powered by self
</p>
