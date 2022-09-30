import { useLocation, useRouteMeta } from 'dumi';
import React, { type FC } from 'react';
import './index.less';

const Toc: FC = () => {
  const { hash } = useLocation();
  const { toc } = useRouteMeta();

  return (
    <ul className="dumi-default-toc">
      {toc
        .filter(({ depth }) => depth > 1 && depth < 4)
        .map((item) => {
          const link = `#${encodeURIComponent(item.id)}`;

          return (
            <li key={item.id} data-depth={item.depth}>
              <a
                href={link}
                title={item.title}
                {...(link === hash ? { className: 'active' } : {})}
              >
                {item.title}
              </a>
            </li>
          );
        })}
    </ul>
  );
};

export default Toc;
