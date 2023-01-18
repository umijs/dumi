import { useIntl, useRouteMeta } from 'dumi';
import React, { type FC } from 'react';
import './index.less';

type IContentTabs = ReturnType<typeof useRouteMeta>['tabs'];

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

  // TODO: tab.Extra & tab.Action render

  return Boolean(tabs?.length) ? (
    <ul className="dumi-default-content-tabs">
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
          <button type="button">
            {tab.titleIntlId
              ? intl.formatMessage({ id: tab.titleIntlId })
              : tab.meta.frontmatter.title}
          </button>
        </li>
      ))}
    </ul>
  ) : null;
};

export default ContentTabs;
