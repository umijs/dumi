import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from '@umijs/runtime';
import throttle from 'lodash.throttle';
import type { NavLinkProps } from 'react-router-dom';

const anchorWatcher = new (class {
  anchors: HTMLAnchorElement[] = [];
  listeners: ((anchorVal: string) => void)[] = [];
  private listener: () => void;

  constructor() {
    this.listener = throttle(this._matchActiveAnchor.bind(this), 200);
  }

  /**
   * get active anchor by position
   */
  private _matchActiveAnchor() {
    // find the first element which close the top of viewport
    const closestElmIndex = this.anchors.findIndex(
      (elm, i) => elm.getBoundingClientRect().top > 128 || i === this.anchors.length - 1,
    );
    const currentElm = this.anchors[Math.max(0, closestElmIndex - 1)];
    const anchorVal = currentElm.parentElement.id;

    // trigger listeners
    this.listeners.forEach(fn => fn(anchorVal));
  }

  /**
   * watch position for specific element
   * @param elm element
   */
  watch(elm: HTMLAnchorElement) {
    if (this.anchors.length === 0 && typeof window !== 'undefined') {
      window.addEventListener('scroll', this.listener);
    }

    this.anchors.push(elm);
    // match immediately to get initial active anchor
    this.listener();
  }

  /**
   * unwatch position for specific element
   * @param elm element
   */
  unwatch(elm: HTMLAnchorElement) {
    this.anchors.splice(
      this.anchors.findIndex(anchor => anchor === elm),
      1,
    );

    if (this.anchors.length === 0 && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.listener);
    }
  }

  /**
   * listen active anchor change
   * @param fn callback
   */
  listen(fn: (anchorVal: string) => void) {
    this.listeners.push(fn);
  }

  /**
   * unlisten active anchor change
   * @param fn callback
   */
  unlisten(fn: (anchorVal: string) => void) {
    this.listeners.splice(
      this.listeners.findIndex(f => f === fn),
      1,
    );
  }
})();

function getElmScrollPosition(elm: HTMLElement) {
  return (
    elm.offsetTop + (elm.offsetParent ? getElmScrollPosition(elm.offsetParent as HTMLElement) : 0)
  );
}

const AnchorLink: React.FC<NavLinkProps> & { scrollToAnchor: (anchor: string) => void } = props => {
  const hash = (props.to as string).match(/(#[^&?]*)/)?.[1] || '';
  const ref = useRef<HTMLAnchorElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (
      // only collect 3-levels title anchors, see also: SlugList.tsx
      ['H1', 'H2', 'H3'].includes(ref.current?.parentElement?.tagName) &&
      ref.current.parentElement.id
    ) {
      // only listen anchors within content area, mark by tranformer/remark/link.ts
      const elm = ref.current;

      // push element to list
      anchorWatcher.watch(elm);

      return () => {
        // release element from list
        anchorWatcher.unwatch(elm);
      };
    }

    // listen active anchor change for non-title anchor links
    const fn = (anchorVal: string) => {
      setIsActive(hash === `#${anchorVal}`);
    };

    anchorWatcher.listen(fn);

    return () => anchorWatcher.unlisten(fn);
  }, []);

  return (
    <NavLink
      {...props}
      ref={ref}
      onClick={() => AnchorLink.scrollToAnchor(hash.substring(1))}
      isActive={() => isActive}
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
