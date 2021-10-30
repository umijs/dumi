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

// eslint-disable-next-line react/prefer-stateless-function
class A extends React.Component<IAProps> {
  render() {
    return <>Hello World!</>
  }
}

export default A;
