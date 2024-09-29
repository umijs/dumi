<template>
  <span
    @click="handleClick"
  >
    <template v-if="icon">
      {{ icon }}
    </template>
    <slot
      v-else
      name="icon"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { VNodeChild } from 'vue';

defineProps<{
  /**
   * 图标字符
   */
  icon?: string;
}>();

defineSlots<{
  /**
   * 图标插槽
   * @alpha
   */
  icon?: VNodeChild;
  default: VNodeChild,
}>();

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>();

function handleClick(e: MouseEvent) {
  emit('click', e);
}

</script>

<style lang="less" scoped>
span {
  border: 1px solid red;
  border-radius: 4px;
  padding: 4px;
}
</style>
