import { useRouteMeta } from 'dumi';
import React from 'react';

export default () => {
  const { frontmatter } = useRouteMeta();
  if (!('hero' in frontmatter)) return null;

  return (
    <div className="dumi-default-hero">
      {frontmatter.hero!.description && (
        <p
          dangerouslySetInnerHTML={{ __html: frontmatter.hero!.description }}
        />
      )}
    </div>
  );
};
