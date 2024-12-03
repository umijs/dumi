---
title: 简单组件
order: 11
---

# 简单组件

## 示例

### 基础使用

```tsx
import { SimpleComp } from '@examples/vue';
import { defineComponent } from 'vue3-oop';

export default defineComponent(() => {
  return () => <SimpleComp data={11111}></SimpleComp>;
});
```

## 属性

<API id="SimpleComp" type="props"></API>

## 插槽

<API id="SimpleComp" type="slots"></API>

## 事件

<API id="SimpleComp" type="events"></API>

## 方法

<API id="SimpleComp" type="imperative"></API>
