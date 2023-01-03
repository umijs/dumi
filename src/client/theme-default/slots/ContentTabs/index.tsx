import { useIntl, useRouteMeta } from 'dumi';
import React, { type FC } from 'react';
import './index.less';

type IContentTabs = ReturnType<typeof useRouteMeta>['tabs'];

const TabsAction: FC<{ tabs: IContentTabs }> = ({ tabs }) => {
  const tabActions = tabs
    ?.map((tab) => tab.components.Action)
    .filter((tab) => tab);

  return Boolean(tabActions?.length) ? (
    <div className="dumi-default-content-tabs-actions">
      {React.createElement(tabActions![0])}
    </div>
  ) : null;
};

export interface IContentTabsProps {
  tabs: IContentTabs;
  tabKey: string | null;
  onChange: (tab?: NonNullable<IContentTabs>[0]) => void;
}

const ContentTabs: FC<IContentTabsProps> = ({
  tabs,
  tabKey: key,
  onChange,
}) => {
  const intl = useIntl();

  return Boolean(tabs?.length) ? (
    <ul className="dumi-default-content-tabs">
      <div className="dumi-default-content-tabs-nav">
        <li onClick={() => onChange()} data-active={!key || undefined}>
          <button type="button">
            {intl.formatMessage({ id: 'content.tabs.default' })}
          </button>
        </li>
        {tabs!.map((tab) => (
          <li
            key={tab.key}
            onClick={() => onChange(tab)}
            data-active={key === tab.key || undefined}
          >
            <button type="button">{tab.meta.frontmatter.title}</button>
            {tab.components.Extra && React.createElement(tab.components.Extra)}
          </li>
        ))}
      </div>
      <TabsAction tabs={tabs} />
    </ul>
  ) : null;
};

export default ContentTabs;
