import React from 'react';

export interface IAwithEmptyDocProps {
  /**
   * extra CSS className for this component
   */
  className?: string;
  style?: React.CSSProperties;
  /**
   * component size
   * @default small
   */
  size: 'small' | 'large';
}

// eslint-disable-next-line react/prefer-stateless-function
class AwithEmptyDoc extends React.Component<IAwithEmptyDocProps> {
  render() {
    return <>Hello World!</>
  }
}

export default AwithEmptyDoc;
