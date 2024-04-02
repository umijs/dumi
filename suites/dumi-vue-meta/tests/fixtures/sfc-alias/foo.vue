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
import { ref, ExtractPropTypes } from 'vue';
import { shallowRef } from 'vue';
import { fooProps } from '../props';

const props = defineProps<ExtractPropTypes<typeof fooProps>>();

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


const emits = defineEmits<{
  /**
   * click event
   */
  click: [event: MouseEvent, extra?: string],
  change: [payload: {name: string}],
}>();

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
