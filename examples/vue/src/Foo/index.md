# SFC Support

## Script Setup (Composition) + Scoped

```vue
<!--
  background: '#f6f7f9'
-->
<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  foo?: string;
  bar?: number;
}>();

const msg = ref('Hello World!');

const color = ref('chartreuse');
</script>

<template>
  <h1 class="msg">{{ msg }}</h1>
  <div>
    <img style="width: 100px;height: 100px;" src="../test.svg" />
    <input v-model="msg" />
  </div>
</template>

<style scoped>
.msg {
  color: v-bind('color');
}
</style>
```

## Options API

```vue
<!--
compact: true
-->
<script>
export default {
  data() {
    return {
      greeting: 'Hello World!',
      color: 'red',
    };
  },
};
</script>

<template>
  <p class="greeting">
    {{ greeting }}
  </p>
</template>

<style>
.greeting {
  color: v-bind('color');
  font-size: 16px;
  font-weight: bold;
}
</style>
```

## External Demo

<code src="./demos/sfc-demo.vue"></code>

## Foo API

### Props

<API id="Foo" type="props"></API>

### Events

<API id="Foo" type="events"></API>
