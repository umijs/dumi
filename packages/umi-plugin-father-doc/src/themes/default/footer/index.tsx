import './index.less';

import React from 'react';

export interface GlobalFooterProps {
  links?:
    | false
    | {
        key?: string;
        title: React.ReactNode;
        href: string;
        blankTarget?: boolean;
      }[];
  copyright?: React.ReactNode;
}

export default ({ links, copyright }: GlobalFooterProps) => {
  if (
    (links == null || links === false || (Array.isArray(links) && links.length === 0)) &&
    (copyright == null || copyright === false)
  ) {
    return null;
  }
  return (
    <footer className="__father-doc-default-footer">
      {links && (
        <div className="__father-doc-default-footer-links">
          {links.map(link => (
            <a
              key={link.key}
              title={link.key}
              target={link.blankTarget ? '_blank' : '_self'}
              href={link.href}
            >
              {link.title}
            </a>
          ))}
        </div>
      )}
      {copyright && <div className="__father-doc-default-footer-copyright">{copyright}</div>}
    </footer>
  );
};
