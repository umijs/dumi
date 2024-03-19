<template>
  <span
    style="background: blueviolet; border-radius: 4px; padding: 4px;"
    @click="handleClick"
  >
    {{ icon }} <slot name="icon" /> <slot />
  </span>
</template>
<script setup lang="ts">
defineProps<{
  icon?: string;
}>();
defineSlots<{
  /**
   * @alpha
   */
  icon?: any;
  default: any,
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
