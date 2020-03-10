---
title: FAQ
---

## dumi 和 Umi 的关系是什么？

dumi 本体是一个 Umi 的 preset——@umijs/preset-dumi，也就是说，我们可以在一个 Umi 的项目中同时使用 dumi。但为了避免 Umi 项目的配置项与 dumi 文档的配置项冲突，建议使用 [UMI_ENV](https://umijs.org/docs/env-variables#umi_env) 进行区分。

## 配置项只有这些吗？想实现更多的功能怎么办？

dumi 基于 Umi，即除了自己提供的配置项以外，还支持[所有 Umi 的配置项](https://umijs.org/config)，并且也支持 [Umi 生态的插件](https://umijs.org/plugins/preset-react)，所以如果需要更多的功能，可以先看一下 Umi 的配置项和插件生态能否满足，如果仍旧不能，欢迎到[讨论群](/guide#参与贡献)反馈或者 GitHub 上[提出 Feature Request](https://github.com/umijs/dumi/issues/new?labels=enhancement&template=feature_request.md&title=feat%3A+)

## 为什么 `README.md` 会出现在文档的首页？

无论是文档还是官网，一定会有首页。dumi 会优先在所有的 `resolve.includes` 文件夹下寻找 `index.md` 或者 `REAdME.md`，如果找不到的话则会使用项目根目录的 `README.md`。

## 如何将文档部署到域名的非根目录？

使用 Umi 的 [base 配置项](https://umijs.org/config#base)即可。

## 如何完全自定义首页？

目前 dumi 尚未开放主题自定义功能，可以通过引入外部嵌入式 Demo 的形式来实现：

```markdown
<!-- index.md -->

<code src="path/to/homepage.tsx" inline />
```

## dumi 支持使用 `.md` 之外的其他方式编写文档吗？

暂不支持。

## dumi 支持基于其他技术框架、例如 Vue、Angular 编写文档和 Demo 吗？

暂不支持；但 Umi 3 在架构上对 renderer 做了抽离，后续如果有其他的 renderer，dumi 也会进行跟进。

## 如何添加统计脚本和全局 CSS 样式？

可使用 Umi 的 [styles](https://umijs.org/config#styles) 和 [scripts](https://umijs.org/config#scripts) 配置项。
