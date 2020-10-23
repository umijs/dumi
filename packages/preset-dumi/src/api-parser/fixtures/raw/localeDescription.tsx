import React from 'react';

export interface IAProps {
  /**
   * @description           default version
   * @description.zh-CN     中文说明
   */
  className?: string;
}

const A: React.FC<IAProps> = () => <>Hello World!</>

export default A;