<template>
  <span
    style="background: blueviolet; border-radius: 4px; padding: 4px;"
    @click="handleClick"
  >
    {{ icon }} <slot name="icon" /> <slot />
  </span>
</template>
<script setup lang="ts">
import { VNodeChild } from 'vue';
defineProps<{
  icon?: string;
}>();
defineSlots<{
  /**
   * @alpha
   */
  icon?: VNodeChild;
  default: VNodeChild,
}>();
const emit = defineEmits<{
  /**
   * @beta
   */
  (e: 'click', event: MouseEvent): void
}>();

function handleClick(e: MouseEvent) {
  emit('click', e);
}

</script>
