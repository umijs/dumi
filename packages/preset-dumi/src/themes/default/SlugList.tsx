import React, { FC, useContext, useRef } from 'react';
import { Link } from 'umi';
import context from './context';
import './SlugList.less';
import getGotoPathName from '../../utils/getGotoPathName';

interface ISlugsListProps {
  base: string;
  slugs: any[];
  className?: string;
  location: any;
}

export function scrollToSlug(slug) {
  const title = document.getElementById(slug);

  if (title) {
    document.documentElement.scrollTop = title.offsetTop - 100;
  }

  return Boolean(title);
}

const SlugsList: FC<ISlugsListProps> = ({ className, slugs, base, location }) => {
  const { slug: currentSlug } = useContext(context);
  const listElm = useRef<HTMLUListElement>(null);

  function handleAnchorClick(ev, id) {
    if (scrollToSlug(id) && listElm.current?.offsetParent?.scrollTop < ev.target.offsetTop) {
      listElm.current.offsetParent.scrollTop = ev.target.offsetTop;
    }
  }

  return (
    <ul className={className} role="slug-list" ref={listElm}>
      {slugs
        .filter(({ depth }) => depth > 1 && depth < 4)
        .map(slug => (
          <li
            key={slug.heading}
            title={slug.value}
            data-depth={slug.depth}
            className={currentSlug === slug.heading ? 'active' : ''}
            onClick={ev => handleAnchorClick(ev, slug.heading)}
          >
            <Link to={getGotoPathName(base, slug.heading, location)}>
              <span>{slug.value}</span>
            </Link>
          </li>
        ))}
    </ul>
  );
};

export default SlugsList;
