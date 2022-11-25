import animateScrollTo from 'animated-scroll-to';
import { useLocation, useRouteMeta, useSiteData } from 'dumi';
import ContentTabs from 'dumi/theme/slots/ContentTabs';
import React, { useEffect, useState, type FC, type ReactNode } from 'react';
import { useTabQueryState } from './useTabMeta';

export const DumiPage: FC<{ children: ReactNode }> = (props) => {
  const { hash } = useLocation();
  const { tabs } = useRouteMeta();
  const [tabKey, setTabKey] = useTabQueryState();
  const [tab, setTab] = useState<NonNullable<typeof tabs>[0] | undefined>(() =>
    tabs?.find(({ key }) => key === tabKey),
  );
  const { setLoading } = useSiteData();

  // update loading status when page loaded
  useEffect(() => {
    setLoading(false);
  }, []);

  // handle hash change
  useEffect(() => {
    const id = hash.replace('#', '');

    setTimeout(() => {
      const elm = id && document.getElementById(decodeURIComponent(id));

      if (elm) {
        // animated-scroll-to instead of native scroll
        animateScrollTo(elm.offsetTop - 80, {
          speed: 200,
        });
      }
    }, 1);
  }, [hash]);

  return (
    <>
      <ContentTabs
        tabs={tabs}
        tabKey={tabKey}
        onChange={(val) => {
          setTab(val);
          setTabKey(val?.key);
        }}
      />
      {tab ? React.createElement(tab.components.default) : props.children}
    </>
  );
};
