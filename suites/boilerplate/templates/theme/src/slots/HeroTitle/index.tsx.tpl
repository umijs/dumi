import { useSiteData } from 'dumi';
import DumiHeroTitle from 'dumi/theme-default/slots/HeroTitle';
import React from 'react';
import type { IThemeConfig } from '../../types';

/**
 * example for add sup to the default hero title
 */
const HeroTitle: typeof DumiHeroTitle = (props) => {
  const themeConfig = useSiteData().themeConfig as IThemeConfig;

  return (
    <>
      <DumiHeroTitle {...props} />
      <sup>{themeConfig.hello}</sup>
    </>
  );
};

export default HeroTitle;
