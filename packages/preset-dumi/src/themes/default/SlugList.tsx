import React, { FC, useContext, useRef } from 'react';
import { Link } from 'umi';
import context from './context';
import './SlugList.less';
import getGotoPathName from '../../utils/getGotoPathName';

interface ISlugsListProps {
  base: string;
  slugs: any[];
  className?: string;
}

const SlugsList: FC<ISlugsListProps> = ({ className, slugs, base }) => {
  const { slug: currentSlug } = useContext(context);
  const listElm = useRef<HTMLUListElement>(null);

  function scrollToSlug(ev, id) {
    const titleElm = document.getElementById(id);

    if (titleElm) {
      document.documentElement.scrollTop = titleElm.offsetTop - 100;

      if (listElm.current?.offsetParent.scrollTop < ev.target.offsetTop) {
        listElm.current.offsetParent.scrollTop = ev.target.offsetTop;
      }
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
            onClick={ev => scrollToSlug(ev, slug.heading)}
          >
            <Link to={getGotoPathName(base, slug.heading)}>{slug.value}</Link>
          </li>
        ))}
    </ul>
  );
};

export default SlugsList;
