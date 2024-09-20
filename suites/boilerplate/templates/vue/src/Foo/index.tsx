import { defineComponent } from 'vue';

export const Foo = defineComponent({
  props: {
    /**
     * @description 标题
     */
    title: {
      type: String,
      default: '',
    },
  },
  setup({ title }) {
    return () => <div>{title}</div>;
  },
});
