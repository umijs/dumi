import { Link, useRouteMeta } from 'dumi';
import HeroTitle from 'dumi/theme/slots/HeroTitle';
import React, { type FC } from 'react';
import './index.less';

const Hero: FC = () => {
  const { frontmatter } = useRouteMeta();

  if (!('hero' in frontmatter)) return null;

  return (
    <div className="dumi-default-hero">
      {frontmatter.hero!.title && (
        <HeroTitle>{frontmatter.hero!.title}</HeroTitle>
      )}
      {frontmatter.hero!.description && (
        <p
          dangerouslySetInnerHTML={{ __html: frontmatter.hero!.description }}
        />
      )}
      {Boolean(frontmatter.hero!.actions?.length) && (
        <div className="dumi-default-hero-actions">
          {frontmatter.hero!.actions!.map(({ text, link }) =>
            /^(\w+:)\/\/|^(mailto|tel):/.test(link) ? (
              <a href={link} target="_blank" rel="noreferrer" key={text}>
                {text}
              </a>
            ) : (
              <Link key={text} to={link}>
                {text}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Hero;
