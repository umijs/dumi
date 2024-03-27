import { defineComponent, PropType, shallowRef, SlotsType } from 'vue';
import './button.less';

export const buttonProps = {
  /**
   * 按钮文字左侧
   * @default ''
   */
  icon: {
    type: String,
    default() {
      return '';
    },
  },

  /**
   * 按钮
   * @deprecated 0.2.0版本将会移除
   */
  size: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'sm',
  },

  /**
   * 点击事件
   */
  onClick: {
    type: Function as PropType<(e?: MouseEvent) => void>,
  },
};

export interface ButtonMethods {
  /**
   * 聚焦
   * @public
   */
  focus: () => void;
  /**
   * 失焦
   * @public
   * @version 0.0.2
   */
  blur: () => void;
}

const Button = defineComponent({
  name: 'MyButton',
  inheritAttrs: false,
  props: buttonProps,
  emits: ['click'],
  slots: Object as SlotsType<{
    /**
     * 图标
     */
    icon?: { name: string };
    default?: any;
  }>,
  expose: ['focus', 'blur'],
  setup(props, { emit, slots, attrs, expose }) {
    function handleClick(e: MouseEvent) {
      emit('click', e);
    }
    const buttonNodeRef = shallowRef<HTMLElement | null>(null);
    const focus = () => {
      buttonNodeRef.value?.focus();
    };
    const blur = () => {
      buttonNodeRef.value?.blur();
    };

    expose({
      focus,
      blur,
    });

    return () => {
      const buttonProps = {
        ...attrs,
        class: 'btn',
        onClick: handleClick,
      };
      const { icon } = props;
      return (
        <button {...buttonProps} ref={buttonNodeRef}>
          {slots.icon ? <slot name="icon"></slot> : icon} {slots.default?.()}
        </button>
      );
    };
  },
});

export default Button as typeof Button & {
  new (): ButtonMethods;
};
