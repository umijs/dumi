import { useRouteMeta } from 'dumi';
import React from 'react';

export default () => {
  // 这里不对，应该要找到正确的 hero
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
