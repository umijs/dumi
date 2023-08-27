---
nav: Hello
group: 测试分组
---

## This is hello/index.md

约定式导航、分组测试

## Issue 1836

> debug https://github.com/umijs/dumi/issues/1836

### case 01

<Identity>Hello Dumi!</Identity>

```tsx | pure
<Identity>Hello Dumi!</Identity>
```

### case 02

<Identity name="Awesome"></Identity>

```tsx | pure
<Identity name="Awesome"></Identity>
```

### case 03

<Identity name="Required<Props>"></Identity>

```tsx | pure
<Identity name="Required<Props>"></Identity>
```

### case 04

<Identity>
  Hello Dumi!
  <Identity name="Awesome"></Identity>
  <Identity name="Required<Props>"></Identity>
  <Identity name="Required<Props>">
    <Identity name="Awesome">Awesome Children</Identity>
  </Identity>
</Identity>

```tsx | pure
<Identity>
  Hello Dumi!
  <Identity name="Awesome"></Identity>
  <Identity name="Required<Props>"></Identity>
  <Identity name="Required<Props>">
    <Identity name="Awesome">Awesome Children</Identity>
  </Identity>
</Identity>
```
