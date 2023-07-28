import { ReactComponent as IconClock } from '@ant-design/icons-svg/inline-svg/outlined/clock-circle.svg';
import { ReactComponent as IconEdit } from '@ant-design/icons-svg/inline-svg/outlined/edit.svg';
import { FormattedMessage, useIntl, useRouteMeta, useSiteData } from 'dumi';
import React, { useLayoutEffect, useState, type FC } from 'react';
import './index.less';

const ContentFooter: FC = () => {
  const { themeConfig } = useSiteData();
  const { frontmatter } = useRouteMeta();
  const intl = useIntl();
  const [isoLastUpdated, setIsoLastUpdated] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const showEditLink = themeConfig.editLink && frontmatter.filename;
  const showLastUpdated = themeConfig.lastUpdated && frontmatter.lastUpdated;

  // to avoid timestamp mismatched between server and client
  useLayoutEffect(() => {
    if (showLastUpdated) {
      setIsoLastUpdated(new Date(frontmatter.lastUpdated!).toISOString());
      setLastUpdated(
        new Intl.DateTimeFormat(undefined, {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(frontmatter.lastUpdated),
      );
    }
  }, [showLastUpdated]);

  return (
    <footer className="dumi-default-content-footer">
      <dl>
        {showLastUpdated && (
          <dd>
            <IconClock />
            <FormattedMessage id="content.footer.last.updated" />
            <time dateTime={isoLastUpdated}>{lastUpdated}</time>
          </dd>
        )}
        {showEditLink && (
          <dd>
            <a
              target="_blank"
              href={`${intl.formatMessage(
                { id: '$internal.edit.link' },
                { filename: frontmatter.filename },
              )}`}
              rel="noreferrer"
            >
              <IconEdit />
              <FormattedMessage id="content.footer.actions.edit" />
            </a>
          </dd>
        )}
      </dl>
    </footer>
  );
};

export default ContentFooter;
