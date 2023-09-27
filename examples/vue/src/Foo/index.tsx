import { defineComponent } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  setup({ title }) {
    return () => <div>{title}</div>;
  },
});
