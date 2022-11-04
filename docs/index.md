---
title: dumi - 为组件研发而生的静态站点框架
hero:
  title: dumi
  description: |
    为组件研发而生的静态站点框架
    <br />
    <small style="opacity: 0.7">
      注：RC 版已非常接近正式版，但仍然可能存在缺陷，如果碰到问题欢迎在 <a href="https://github.com/umijs/dumi/discussions/1216" target="_blank" rel="noreferrer" style="color: #06f">讨论区</a> 反馈
    </small>
  actions:
    - text: 抢先体验
      link: /guide
    - text: GitHub
      link: https://github.com/umijs/dumi
features:
  - title: 更好的编译性能
    emoji: 🚀
    description: 通过结合使用 <a href="https://umijs.org/blog/mfsu-faster-than-vite" target="_blank" rel="noreferrer">Umi 4 MFSU</a>、esbuild、SWC、持久缓存等方案，带来比 dumi 1.x 更快的编译速度
  - title: 内置全文搜索
    emoji: 🔍
    description: 不需要接入任何三方服务，标题、正文、demo 等内容均可被搜索，支持多关键词搜索，且不会带来产物体积的增加
  - title: 全新主题系统
    emoji: 🎨
    description: 为主题包增加插件、国际化等能力的支持，且参考 <a href="https://docusaurus.io/docs/swizzling" target="_blank" rel="noreferrer">Docusaurus</a> 为主题用户提供局部覆盖能力，更强更易用
  - title: 约定式路由增强
    emoji: 🚥
    description: 通过拆分路由概念、简化路由配置等方式，让路由生成一改 dumi 1.x 的怪异、繁琐，更加符合直觉
  - title: 资产元数据 2.0
    emoji: 💡
    description: 在 1.x 及 JSON Schema 的基础上对资产属性定义结构进行全新设计，为资产的流通提供更多可能
  - title: 继续为组件研发而生
    emoji: 💎
    description: 提供与全新的 NPM 包研发工具 <a href="https://github.com/umijs/father" target="_blank" rel="noreferrer">father 4</a> 集成的脚手架，为开发者提供一站式的研发体验
---

## 谁在使用

<WhoAreUsing></WhoAreUsing>

## 反馈与共建

请访问 [GitHub](https://github.com/umijs/dumi) 或加入讨论群：

<div>
  <img data-type="dingtalk" src="https://gw.alipayobjects.com/zos/bmw-prod/ce3439e7-3bf9-4031-b823-6473439ec9e6/kxkiis4c_w1004_h1346.jpeg" width="300" />
  <img data-type="wechat" src="https://gw.alipayobjects.com/zos/bmw-prod/c18bc2a5-719a-48ca-b225-c79ef88bfb43/k7m10ymd_w1004_h1346.jpeg" width="300" />
</div>

目前 dumi 2 的各项特性实现情况如下，也欢迎查看 [RoadMap](https://github.com/umijs/dumi/issues/1151) 及 [TODO List](https://github.com/umijs/dumi/issues/1157) 一起参与 dumi 2 的建设：

| 核心特性          | 已支持的功能                                                                                                                                                                                                        | 尚未支持的功能                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 🚀 编译性能提升   | Umi 4 的 [MFSU v3 编译提速方案](https://umijs.org/blog/mfsu-faster-than-vite)<br />升级 unified 生态进行 Markdown 编译<br />使用 esbuild 进行 demo 依赖分析<br />使用 swc 进行 demo 编译<br />Markdown 编译持久缓存 | Umi 4 的 vite 模式                   |
| 🛠 开放能力增强    | 支持自定义渲染技术栈<br />支持预览器自定义<br />支持自定义 unified 插件<br />组件页 Tabs 自定义                                                                                                                     | 提供 Vue 组件渲染方案                |
| 🚦 约定式路由增强 | 文档、实体路由设计拆分<br />约定式导航栏生成<br />约定式侧边菜单生成                                                                                                                                                | --                                   |
| 🌈 主题系统增强   | [全新主题系统](https://github.com/umijs/dumi/discussions/1180)<br />支持本地主题及主题包<br />支持国际化<br />支持[多栏 demo](https://github.com/umijs/dumi/discussions/1187)<br />全文搜索 API<br />主题研发脚手架 | --                                   |
| 🖥 静态站点增强    | 支持配置页面级 TDK<br />内置 404 页面、支持定制 <br />HTML 静态输出                                                                                                                                                 | 构建时预渲染                         |
| ☀️ 全新默认主题   | 基础 PC 样式<br />新版首页                                                                                                                                                                                          | 响应式支持<br />内置组件支持         |
| 💎 设计系统相关   | 支持注入全局 Design<br />生成资产元数据 Token                                                                                                                                                                       | 拷贝 demo 到 Sketch                  |
| 💡 资产元数据 2.0 | 新版资产元数据类型定义                                                                                                                                                                                              | --                                   |
| 🕹 构建能力集成    | 全新组件研发脚手架<br />father 配置识别自动转换 dumi 相关配置                                                                                                                                                       | --                                   |
| 🔍 应用内全文搜索 | 标题、正文、demo 可被搜索<br />支持多关键词匹配                                                                                                                                                                     | --                                   |
| 🤖 自动 API 增强  | 全新 API 解析器<br />基础 API 表格                                                                                                                                                                                  | 增强 API 表格<br />pnpm 仓库解析提速 |
| 🎨 组件属性面板   | --                                                                                                                                                                                                                  | 暂未实现                             |
| 🗞 全新集成模式    | --                                                                                                                                                                                                                  | 暂未实现                             |
