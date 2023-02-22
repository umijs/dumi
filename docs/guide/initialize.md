---
nav: 指南
group:
  title: 基础
  order: 0
order: 0
mobile: false
---

```tsx | inline
export default () => <input type="text" placeholder="test 1" />;
```

---

```tsx | inline
export default () => <textarea placeholder="test 2" />;
```

---

```tsx
export default () => <input type="text" placeholder="test 3" />;
```

```tsx
export default () => (
  <div
    contentEditable
    style={{ width: '300px', height: '50px', backgroundColor: 'cyan' }}
  >
    可以输入内容哦
  </div>
);
```

# 初始化

## 环境准备

确保正确安装 [Node.js](https://nodejs.org/en/) 且版本为 14+ 即可。

```bash
$ node -v
v14.19.1
```

## 脚手架

```bash
# 先找个地方建个空目录。
$ mkdir myapp && cd myapp

# 通过官方工具创建项目，选择你需要的模板
$ npx create-dumi

# 安装依赖后启动项目
$ npm start
```
