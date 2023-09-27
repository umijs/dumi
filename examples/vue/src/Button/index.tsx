import { defineComponent, PropType } from 'vue';
import './button.less';

export const props = {
  /**
   * @description 按钮文字左侧的图标
   */
  icon: {
    type: String,
    default: '',
  },
  /**
   * @description 点击事件
   */
  onClick: {
    type: [Function] as PropType<(e: MouseEvent) => void>,
    default: () => {},
  },
};

export default defineComponent({
  inheritAttrs: false,
  props,
  setup(props, { emit, slots, attrs }) {
    function handleClick(e: MouseEvent) {
      emit('click', e);
    }
    return () => {
      const buttonProps = {
        ...attrs,
        class: 'btn',
        onClick: handleClick,
      };
      const { icon } = props;
      return (
        <button {...buttonProps}>
          {icon} {slots.default?.()}
        </button>
      );
    };
  },
});
