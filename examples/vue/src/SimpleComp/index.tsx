import type { VNodeChild } from 'vue';
import { defineComponent } from 'vue3-oop';

export interface SimpleCompProps {
  /**
   * @description 数据源
   */
  data?: number;
  /**
   * @description 打开事件
   */
  onOpen?: () => void;

  /**
   * @description foo插槽
   */
  renderFoo?: (name: string) => VNodeChild;
}

export interface SimpleCompExpose {
  /**
   * @description 聚焦芳芳
   * @public
   * @param name 姓名
   */
  focus: (name: string) => void;
}

export interface SimpleCompSlots {
  /**
   * bar插槽
   * @param name 1111
   */
  bar: (name: string) => VNodeChild;
}

export const SimpleComp = defineComponent<
  SimpleCompProps,
  SimpleCompSlots,
  SimpleCompExpose
>((props) => {
  return () => <div>{props.data}</div>;
});
