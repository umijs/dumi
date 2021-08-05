import React from 'react';

export interface IAwithPropFilterAProps {
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
class AwithPropFilter extends React.Component<IAwithPropFilterAProps> {
  render() {
    return <>Hello World!</>
  }
}

export default AwithPropFilter;
