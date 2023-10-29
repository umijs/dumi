import { defineComponent } from 'vue';

export default defineComponent({
  inheritAttrs: false,
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
