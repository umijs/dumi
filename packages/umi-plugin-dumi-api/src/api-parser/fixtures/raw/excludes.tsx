import React from 'react';

export interface IAwithExcludesProps {
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
class AwithExcludes extends React.Component<IAwithExcludesProps> {
  render() {
    return <>Hello World!</>
  }
}

export default AwithExcludes;
