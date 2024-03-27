import { PropType } from 'vue';
import { object, oneOf } from 'vue-types';

export const order = {
  type: Number,
  required: true,
  default: 0,
};

export const baseProps = {
  /**
   * @default {}
   */
  b: object<{ c?: string }>().def({}).isRequired,
  /**
   * @experimental
   */
  c: String as PropType<'1' | '2' | '3'>,
  /**
   * @deprecated
   */
  d: oneOf([1, 2, 3]).def(1),
};
