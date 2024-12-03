import { h } from 'vue';

export { default as Button } from './Button';
export * from './ClassComp';
export { default as Foo } from './Foo';
export * from './List';
export * from './SimpleComp';
export { default as Article } from './functional';
export { default as Badge } from './my-badge.vue';

export function useVNode() {
  return h('div');
}
