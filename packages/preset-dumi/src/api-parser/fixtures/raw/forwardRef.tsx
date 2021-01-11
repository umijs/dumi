import React from 'react';
import type { IAProps } from './class';
import A from './class';

export interface IBProps extends IAProps {
  ref?: React.LegacyRef<HTMLDivElement>,
}

class B extends React.Component<IBProps> {
  render() {
    const { ref, ...props } = this.props;

    return (
      <div ref={ref}>
        <A {...props} />
      </div>
    );
  }
}

export default React.forwardRef<HTMLDivElement, IBProps>((props, ref) => (
  // FIXME: ts type error
  // @ts-ignore
  <B {...props} ref={ref} />
));
