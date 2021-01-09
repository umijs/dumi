import React from 'react';
import { NavLink } from '@umijs/runtime';
import { NavLinkProps } from 'react-router-dom';

function getElmScrollPosition(elm: HTMLElement) {
  return (
    elm.offsetTop + (elm.offsetParent ? getElmScrollPosition(elm.offsetParent as HTMLElement) : 0)
  );
}

const AnchorLink: React.FC<NavLinkProps> & { scrollToAnchor: (anchor: string) => void } = props => {
  const hash = (props.to as string).match(/(#.+)$/)?.[1] || '';

  return (
    <NavLink
      {...props}
      onClick={() => AnchorLink.scrollToAnchor(hash.substring(1))}
      isActive={(_, location) => hash && decodeURIComponent(location.hash) === hash}
    />
  );
};

AnchorLink.scrollToAnchor = (anchor: string) => {
  // wait for dom update
  window.requestAnimationFrame(() => {
    const elm = document.getElementById(decodeURIComponent(anchor));

    if (elm) {
      // compatible in Edge
      window.scrollTo(0, getElmScrollPosition(elm) - 100);
    }
  });
};

export default AnchorLink;
