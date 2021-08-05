import React from 'react';
import type { Node } from 'unist';

export interface IAextendsNodeProps extends Node {
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
class AextendsNode extends React.Component<IAextendsNodeProps> {
  render() {
    return <>Hello World!</>
  }
}

export default AextendsNode;
