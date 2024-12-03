---
order: 10
---

# Class 组件支持

## 基础例子

```tsx
/**
 * title: 代码示例
 */
import { ClassCount } from '@examples/vue';
import { defineComponent } from 'vue';
import { Mut, VueComponent } from 'vue3-oop';

class AAA extends VueComponent {
  @Mut() count = 1001;
  render() {
    return (
      <div onClick={() => this.count++}>class component: {this.count}</div>
    );
  }
}

export default defineComponent(() => () => (
  <div>
    <ClassCount initValue={10}></ClassCount>
  </div>
));
```

## 属性

<API id="ClassCount" type="props"></API>

## 事件

<API id="ClassCount" type="events"></API>

## 方法

<API id="ClassCount" type="imperative"></API>

## slots

<API id="ClassCount" type="slots"></API>
