import { h, shallowRef, watch } from 'vue';

/**
 * @public
 */
export function useInternalValue<T>(
  upstreamValue: () => T,
  updator: (upstreamValue: T, oldValue?: T) => T = (v) => v,
  equal: (internalValue: T, newValue: T) => boolean = (i, n) => i === n,
) {
  const internalValue = shallowRef(updator(upstreamValue()));
  watch(upstreamValue, (value, oldValue) => {
    // user may have updated the internal value
    if (equal(internalValue.value, value)) return;
    internalValue.value = updator(value, oldValue);
  });
  return internalValue;
}
/**
 * This function will be considered a composition function
 */
export function useVNode() {
  return h('div');
}

/**
 * @component
 * @description
 * Only if it is marked `@component` can it be considered a Functional Component,
 * otherwise it will be a plain function
 */
export function InternalComponent(props: { a: string }) {
  return h('div', props.a);
}
