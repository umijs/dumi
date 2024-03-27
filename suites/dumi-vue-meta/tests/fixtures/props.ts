import { PropType } from 'vue';
import { baseProps, order } from './externalProps';

export interface AItem {
  id: string;
}

export interface A {
  a: AItem;
}

export type JSXComponent<Component, ExposedApi> = Component & {
  new (): ExposedApi;
};

export type PromiseArgs = {
  args: string[];
};

export const fooProps = {
  /**
   * @description 标题
   * @default ''
   */
  title: {
    type: String,
    required: true,
    default: '标题',
  },
  /**
   * @description 顺序
   */
  order,
  a: {
    type: Array<A>,
    required: true,
    default: [],
  },
  ...baseProps,
  /**
   * @beta
   */
  e: [Object, Number] as PropType<A | 1>,
  onConfirm: Function as PropType<(output: { children: any[] }) => void>,
  /**
   * @since 0.0.1
   */
  dom: {
    type: Object as PropType<HTMLElement>,
    default: null,
  },
  /**
   * @alpha
   * @description
   */
  func: Function as PropType<(args: PromiseArgs) => Promise<{ type?: string }>>,
};

export type FooSlotsType = {
  /**
   * icon
   * @experimental
   * @description icon
   */
  icon?: any;
  /**
   * item
   * @deprecated
   */
  item?: { list: string[]; extra?: boolean };
};
