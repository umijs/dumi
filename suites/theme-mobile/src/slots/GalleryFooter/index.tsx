import { useSiteData } from 'dumi';
import React, { type FC } from 'react';

const Footer: FC = () => {
  const { themeConfig } = useSiteData();

  if (!themeConfig.footer) return null;

  return (
    <div
      className="dumi-default-footer"
      dangerouslySetInnerHTML={{ __html: themeConfig.footer }}
    />
  );
};

export default Footer;
