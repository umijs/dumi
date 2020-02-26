import React, { FC, useContext } from 'react';
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

  function scrollToSlug(id) {
    const elm = document.getElementById(id);

    if (elm) {
      document.documentElement.scrollTop = elm.offsetTop - 100;
    }
  }

  return (
    <ul className={className} role="slug-list">
      {slugs
        .filter(({ depth }) => depth > 1 && depth < 3)
        .map(slug => (
          <li
            key={slug.heading}
            title={slug.value}
            data-depth={slug.depth}
            className={currentSlug === slug.heading ? 'active' : ''}
            onClick={() => scrollToSlug(slug.heading)}
          >
            <Link to={getGotoPathName(base, slug.heading)}>{slug.value}</Link>
          </li>
        ))}
    </ul>
  );
};

export default SlugsList;
