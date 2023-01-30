import React, {
  Children,
  cloneElement,
  useMemo,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react';

import './index.less';

type ThemeInfo = {
  // site description: ≤120 characters
  'data-description': string;
  // site screenSnapShotURI: screenSnapShotURI of your theme
  'data-picture': string;
  // site sourceCodeURI: the source code url
  'data-source'?: string;
  // site title: <= 60 characters
  'data-title': string;
  // site url: live production deployment URL of your theme demo site
  'data-url': string;
};

type ThemeCasesChildren = ReactElement | string;

const ThemeCases: FC<{ children: ThemeCasesChildren }> = ({ children }) => {
  const Themes = useMemo<ReactNode>(() => {
    return Children.map(children, (child) => {
      if (typeof child === 'object' && child.type === 'ul') {
        const themeCases = child.props.children;
        if (Children.count(themeCases)) {
          const travelChildren = Children.map(themeCases, (theme) => {
            if (theme.type === 'li') {
              const themeInfo = theme.props as ThemeInfo;
              const title = themeInfo['data-title'];
              return (
                <li className="dumi-site-theme-cases-item" key={title}>
                  <div className="dumi-site-theme-cases-image">
                    <img src={themeInfo['data-picture']} alt={title} />
                  </div>
                  <div className="dumi-site-theme-cases-infomation">
                    <div className="dumi-site-theme-cases-summary">
                      <h4>
                        <a
                          href={themeInfo['data-url']}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {title}
                        </a>
                      </h4>
                      {themeInfo['data-source'] && (
                        <a
                          className="dumi-site-theme-cases-button secondary"
                          href={themeInfo['data-source']}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          源码
                        </a>
                      )}
                    </div>
                    <p>{themeInfo['data-description']}</p>
                  </div>
                </li>
              );
            }
          });
          return cloneElement(child, {
            ...child.props,
            children: travelChildren,
          });
        }
      }
      return null;
    });
  }, [children]);

  return <div className="dumi-site-theme-cases">{Themes}</div>;
};

export default ThemeCases;
