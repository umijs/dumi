import React, { FC, useContext } from 'react';
import { Link } from 'umi';
import context from './context';
import './SlugList.less';

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
      {slugs.map(slug => (
        <li
          key={slug.heading}
          title={slug.value}
          data-depth={slug.depth}
          className={currentSlug === slug.heading ? 'active' : ''}
          onClick={() => scrollToSlug(slug.heading)}
        >
          <Link
            to={`${base}${/^(#\/|[^#])/.test(window.location.hash) ? '?anchor=' : '#'}${
              slug.heading
            }`}
          >
            {slug.value}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SlugsList;
