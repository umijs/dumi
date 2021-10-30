import React from 'react';

export interface IAProps {
  /**
   * extra CSS className for this component
   */
  className?: string;
  /**
   * inline styles
   */
  style?: React.CSSProperties;
  /**
   * component size
   * @default small
   */
  size: 'small' | 'large';
}

const A: React.FC<IAProps> = () => <>Hello World!</>

export default A;