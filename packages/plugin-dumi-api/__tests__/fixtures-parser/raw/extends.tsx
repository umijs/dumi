import React from 'react';
import type { IAProps } from './class';

export interface IBProps extends IAProps {
  /**
   * @default true
   */
  isB: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
class B extends React.Component<IBProps> {
  render() {
    return <>Hello World!</>
  }
}

export default B;
