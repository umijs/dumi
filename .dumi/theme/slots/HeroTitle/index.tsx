// @ts-ignore
import HeroTitle from 'dumi/theme-original/slots/HeroTitle';
import React, { type FC, type ReactNode } from 'react';
import './index.less';

const BetaHeroTitle: FC<{ children: ReactNode }> = (props) => (
  <div className="dumi-site-beta-hero-title">
    <HeroTitle {...props} />
    <small>2.0 RC</small>
  </div>
);

export default BetaHeroTitle;
