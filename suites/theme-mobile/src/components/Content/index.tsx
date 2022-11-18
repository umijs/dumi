import React from 'react';

/**
 * alita content
 *
 * ```typescript
 * <Page>
 *   <Content></Content>
 * </Page>
 * ```
 */
const Content: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ children, style, ...reset }) => {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 0,
        display: 'block',
        flex: 1,
        width: '100%',
        height: '100%',
        margin: '0!important',
        padding: '0!important',
        overflowY: 'auto',
        touchAction: 'pan-y',
        willChange: 'scroll-position',
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
        ...style,
      }}
      {...reset}
    >
      {children}
    </div>
  );
};

export default Content;
