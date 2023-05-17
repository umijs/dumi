---
nav: 指南
group: 基础
order: 1
---

# 目录结构

一个普通的、使用 dumi 做研发的组件库目录结构大致如下：

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
          guide
          <small>组件库其他文档路由表（示意）</small>
          <ul>
            <li>index.md</li>
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
      .dumirc.ts
      <small>dumi 配置文件</small>
    </li>
    <li>
      .fatherrc.ts
      <small>father-build 的配置文件，用于组件库打包</small>
    </li>
  </ul>
</Tree>

如果是单纯的文档站点、不包含组件源码，忽略上面的 `src` 目录结构即可。

注意，此处仅对目录结构做说明，如果要初始化一个 dumi 项目，建议直接使用 `create-dumi` 的脚手架进行创建。
