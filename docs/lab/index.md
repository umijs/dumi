---
title: 实验室
nav:
  title: 实验室
sidemenu: false
---

<Alert>
实验室的功能仅在 <code>next</code> 版本中提供，可以使用 <code>npm i dumi@next</code> 安装实验版本进行体验；实验性质的功能可能不稳定，请谨慎用于生产；如果体验后有任何建议，欢迎在讨论群中进行反馈和交流 ❤
</Alert>

## 和 Umi UI 一起使用

**依赖版本：**`dumi@1.1.0-beta.0+` & `@umijs/preset-ui@2.2.0+`

使用流程如下图所示：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/a873195d-32fe-427d-9756-a002d7644d85/kc5y7qpk_w2078_h1757.png" width="800" >
</p>

### 使用方式

#### 1. 添加 Demo 元信息

在使用 dumi 做组件研发的同时，给组件的 Demo 添加一些元信息：

<pre>
```jsx
/**
 * title: Demo 的名称
 * thumbnail: Demo 的预览缩略图地址
 */

// 正常的 Demo 源代码
```
</pre>

或者

```html
<code src="/path/to/demo.tsx" title="Demo 的名称" thumbnail="Demo 的预览缩略图地址" />
```

#### 2. 在 publish 前生成资产元数据

然后在 `package.json` 中添加一条 npm script：

```json
{
  "scripts": {
    "postversion": "dumi assets"
  }
}
```

并且在 `gitignore` 中添加 `assets.json`。

#### 3. 添加资产元数据字段

在 `package.json` 中添加 `dumiAssets` 字段：

```json
{
  "dumiAssets": "assets.json"
}
```

#### 4. 在 Umi UI 中使用

走完正常的 npm 发布流程后，将组件库安装到使用 Umi UI 的项目中，即可在 Umi UI 的资产列表中看到基于 dumi 研发的资产列表，并可直接插入到页面中进行使用：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/4102a494-e4d8-494e-a790-1a7a5562da51/kc6gnqjd_w680_h387.gif" width="680">
</p>
