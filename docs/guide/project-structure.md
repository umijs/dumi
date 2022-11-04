---
nav: 指南
group: 基础
order: 1
---

# 目录结构

一个普通的、使用 dumi 做研发的组件库目录结构大致如下：

```bash
.
├── docs               # 组件库文档目录
│   ├── index.md       # 组件库文档首页
│   ├── guide          # 组件库其他文档路由表（示意）
│   │   ├── index.md
│   │   └── help.md
├── src                # 组件库源码目录
│   ├── Button         # 单个组件
│   │   ├── index.tsx  # 组件源码
│   │   ├── index.less # 组件样式
│   │   └── index.md   # 组件文档
│   └── index.ts       # 组件库入口文件
├── .dumirc.ts         # dumi 配置文件
└── .fatherrc.ts       # father-build 的配置文件，用于组件库打包
```

如果是单纯的文档站点、不包含组件源码，忽略上面的 `src` 目录结构即可。

注意，此处仅对目录结构做说明，如果要初始化一个 dumi 项目，建议直接使用 `create-dumi` 的脚手架进行创建。
