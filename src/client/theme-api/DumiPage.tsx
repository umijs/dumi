import { useRouteMeta, useSiteData } from 'dumi';
import ContentTabs from 'dumi/theme/slots/ContentTabs';
import React, { useEffect, useState, type FC, type ReactNode } from 'react';

export const DumiPage: FC<{ children: ReactNode }> = (props) => {
  const { tabs } = useRouteMeta();
  const [tab, setTab] = useState<NonNullable<typeof tabs>[0] | undefined>();
  const { setLoading } = useSiteData();

  // update loading status when page loaded
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <ContentTabs
        tabs={tabs}
        tabKey={tab?.key}
        onChange={(val) => {
          setTab(val);
        }}
      />
      {tab ? React.createElement(tab.components.default) : props.children}
    </>
  );
};
