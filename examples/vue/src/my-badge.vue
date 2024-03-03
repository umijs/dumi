<template>
  <span style="background: blueviolet; border-radius: 4px; padding: 4px;">
    {{ icon }}
  </span>
</template>
<script setup lang="ts">
defineProps<{
  icon?: string;
}>();
</script>
