import { useRouteMeta } from 'dumi';
import React, { type FC } from 'react';
import './index.less';

const Features: FC = () => {
  const { frontmatter } = useRouteMeta();

  return Boolean(frontmatter.features?.length) ? (
    <div
      className="dumi-default-features"
      // auto render 2 or 3 cols by feature count
      data-cols={
        [3, 2].find((n) => frontmatter.features!.length % n === 0) || 3
      }
    >
      {frontmatter.features!.map(({ title, description, emoji }) => (
        <div key={title} className="dumi-default-features-item">
          {emoji && <i>{emoji}</i>}
          {title && <h3>{title}</h3>}
          {description && (
            <p dangerouslySetInnerHTML={{ __html: description }} />
          )}
        </div>
      ))}
    </div>
  ) : null;
};

export default Features;
