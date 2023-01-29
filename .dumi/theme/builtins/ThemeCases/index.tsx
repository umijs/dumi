import { useSiteData } from 'dumi';
import React, { useMemo, type FC } from 'react';

import './index.less';

export type ThemeCasesItem = {
  // site title: <= 60 characters
  title: string;
  // site description: ≤120 characters
  description: string;
  // site url: live production deployment URL of your theme demo site
  url: string;
  // site sourceCodeURI: the source code url
  sourceCodeURI: string;
  // site screenSnapShotURI: screenSnapShotURI of your theme
  screenSnapShotURI: string;
};

const ThemeCases: FC = () => {
  const {
    themeConfig: { themeCases },
  } = useSiteData();

  const themes = useMemo<ThemeCasesItem[]>(() => {
    return Object.entries(themeCases as Record<string, ThemeCasesItem>).map(
      ([, item]) => item,
    );
  }, [themeCases]);

  return (
    <div className="dumi-site-theme-cases">
      <div className="dumi-site-theme-cases-center">
        <h2>Dumi 主题市场</h2>
        <p>为 dumi 设计的主题</p>
        <a
          className="dumi-site-theme-cases-button primary"
          type="button"
          href="https://github.com/umijs/dumi/edit/master/theme-cases.json"
          target="_blank"
          rel="noopener noreferrer"
        >
          提交主题
        </a>
      </div>
      <ul className="dumi-site-theme-cases-list">
        {themes.map(
          ({ title, screenSnapShotURI, sourceCodeURI, url, description }) => (
            <li className="dumi-site-theme-cases-item" key={title}>
              <div className="dumi-site-theme-cases-image">
                <img src={screenSnapShotURI} alt={title} />
              </div>
              <div className="dumi-site-theme-cases-infomation">
                <div className="dumi-site-theme-cases-summary">
                  <h4>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {title}
                    </a>
                  </h4>
                  {sourceCodeURI && (
                    <a
                      className="dumi-site-theme-cases-button secondary"
                      href={sourceCodeURI}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      源码
                    </a>
                  )}
                </div>
                <p>{description}</p>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
};

export default ThemeCases;
