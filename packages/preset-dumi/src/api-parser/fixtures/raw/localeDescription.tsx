import React from 'react';

export interface IAProps {
  /**
   * @description           default version
   * @description.zh-CN     中文说明
   * @default               { type: 'A', value: [{ name: 'B' }] }
   */
  className?: string;
}

const A: React.FC<IAProps> = () => <>Hello World!</>

export default A;