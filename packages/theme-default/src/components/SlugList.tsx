import type { FC } from 'react';
import React from 'react';
import { AnchorLink, useLinkHighlight } from 'dumi/theme';
import './SlugList.less';

const SlugsList: FC<{ slugs: any; className?: string }> = ({ slugs, ...props }) => {
  const anchors = slugs.filter(({ depth }) => depth > 1 && depth < 4);

  const activeHash = useLinkHighlight(anchors);

  return (
    <ul role="slug-list" {...props}>
      {anchors.map(slug => (
        <li key={slug.heading} title={slug.value} data-depth={slug.depth}>
          <AnchorLink to={`#${slug.heading}`} active-hash={activeHash}>
            <span>{slug.value}</span>
          </AnchorLink>
        </li>
      ))}
    </ul>
  );
};

export default SlugsList;
