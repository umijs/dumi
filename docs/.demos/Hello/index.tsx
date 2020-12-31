import React from 'react';

export interface IHelloProps {
  /**
   * Extra CSS className for this component
   * @description.zh-CN 组件额外的 CSS className
   */
  className?: string;
  /**
   * I'm required
   * @description.zh-CN 我是一个必选属性
   */
  type: string;
}

const Hello: React.FC<IHelloProps> = () => <>Hello World!</>;

export default Hello;
