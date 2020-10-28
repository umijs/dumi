import React from 'react';

export interface IHelloProps {
  /**
   * extra CSS className for this component
   * @description.zh-CN 组件额外的 CSS className
   */
  className?: string;
}

const Hello: React.FC<IHelloProps> = () => <>Hello World!</>;

export default Hello;
