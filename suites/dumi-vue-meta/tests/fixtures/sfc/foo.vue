<template>
    <div ref={rootRef}
        @click={handleClick}
        @change={handleChange}>
        {{props.a}}
        {{slots?.icon}}
        {{slots?.item({ list: [], extra: true })}}
      </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { shallowRef } from 'vue';
import { fooProps } from '../props';

const props = defineProps(fooProps);

const rootRef = shallowRef<HTMLElement | null>(null);
const publicCount = ref(0);

const focus = () => {
  rootRef.value?.focus();
};
defineExpose({
  /**
   * @alpha
   * @description The signature of the expose api should be obtained from here
   */
  focus,
  /**
   * @deprecated will be released in 0.0.1
   */
  count: publicCount.value,
});

interface Events {
  /**
   * click event
   */
  (e: 'click', event: MouseEvent, extra?: string): void
  (e: 'change', payload: { name: string }): void
}


const emits = defineEmits<Events>();

function handleClick(e: MouseEvent) {
  emits('click', e, 'extra');
}
function handleChange() {
  emits('change', {
    name: 'change'
  });
}

const slots = defineSlots<{
  /**
   * icon
   * @experimental
   * @description icon
   */
  icon: any,
  /**
   * item
   * @deprecated
   */
  item(options: { list: string[], extra?: boolean }): any,
}>();
</script>
