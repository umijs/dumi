---
toc: content
group: 其他
order: 1
---

# 命令行

## `dumi dev`

启动本地开发服务器，进行项目的开发与调试。

## `dumi build`

构建 dumi 文档产物，适用于生产环境的部署。

## `dumi preview`

在本地启动一个静态 Web 服务器，将 docs-dist 文件夹运行在 http://127.0.0.1:4172, 用于预览构建后产物。

你可以通过 `--port` 参数来配置服务的运行端口。

```bash
dumi preview --port 9527
```

现在 `preview` 命令会将服务器运行在 http://127.0.0.1:9527

## `dumi setup`

初始化项目，会做临时文件的生成等操作。通常在 package.json 的 `scripts.prepare` 里设置。

```json
{
  "scripts": {
    "prepare": "dumi setup"
  }
}
```

## `dumi version`

查看 dumi 版本，等同于 `dumi -v`。
