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

## iframe

```vue
<!--
  iframe: true
-->

<script setup>
import { Button, Badge } from '@examples/vue';
</script>

<template>
  <Button>
    <Badge icon="🆙">iframe</Badge>
  </Button>
</template>
```

## Foo API

### Props

<API id="Foo" type="props"></API>

### Events

<API id="Foo" type="events"></API>

## Badge API

### Props

<API id="Badge" type="props"></API>

### Slots

<API id="Badge" type="slots"></API>

### Events

<API id="Badge" type="events"></API>

## useVNode

<API id="useVNode"></API>
