<template>
  <Button @click="handleClick">
    <Foo :title="msg" />
  </Button>
</template>

<script setup>
import { Foo, Button } from '@examples/vue';
const msg = 'Hello!';

function handleClick() {
  alert(msg);
}
</script>

<style scoped>
.demo {
  font-size: 14px;
  color: cornflowerblue;
}
</style>
