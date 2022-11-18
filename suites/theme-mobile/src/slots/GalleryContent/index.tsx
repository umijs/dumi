import { useFullSidebarData, useSiteData } from 'dumi';
import React from 'react';

export default () => {
  const { demos } = useSiteData();
  const sidebar = useFullSidebarData();
  console.log(sidebar);
  console.log(demos);
  return (
    <>
      <code>需要补充列表渲染</code>
    </>
  );
};
