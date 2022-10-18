import React, { type FC, type ReactNode } from 'react';
import './index.less';

const HeroTitle: FC<{ children: ReactNode }> = (props) => (
  <h1 className="dumi-default-hero-title">
    <span>{props.children}</span>
  </h1>
);

export default HeroTitle;
