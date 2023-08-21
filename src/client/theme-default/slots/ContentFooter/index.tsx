import { ReactComponent as IconLeft } from '@ant-design/icons-svg/inline-svg/outlined/arrow-left.svg';
import { ReactComponent as IconClock } from '@ant-design/icons-svg/inline-svg/outlined/clock-circle.svg';
import { ReactComponent as IconEdit } from '@ant-design/icons-svg/inline-svg/outlined/edit.svg';
import {
  FormattedMessage,
  Link,
  useIntl,
  useLocation,
  useRouteMeta,
  useSidebarData,
  useSiteData,
} from 'dumi';
import React, { useLayoutEffect, useState, type FC } from 'react';
import './index.less';

const ContentFooter: FC = () => {
  const { pathname } = useLocation();
  const sidebar = useSidebarData();
  const { themeConfig } = useSiteData();
  const { frontmatter } = useRouteMeta();
  const intl = useIntl();
  const [prev, setPrev] = useState<
    typeof sidebar[0]['children'][0] | undefined
  >(undefined);
  const [next, setNext] = useState<typeof prev>(undefined);
  const [isoLastUpdated, setIsoLastUpdated] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const showEditLink = themeConfig.editLink && frontmatter.filename;
  const showLastUpdated = themeConfig.lastUpdated && frontmatter.lastUpdated;

  // calculate the previous and next page
  useLayoutEffect(() => {
    if (sidebar) {
      const items = sidebar.reduce<typeof sidebar[0]['children']>(
        (ret, group) => ret.concat(group.children),
        [],
      );
      const current = items.findIndex((item) => item.link === pathname);

      setPrev(items[current - 1]);
      setNext(items[current + 1]);
    }
  }, [pathname, sidebar]);

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
      <nav>
        {prev && (
          <Link to={prev.link} data-prev>
            <small>
              <IconLeft />
              <FormattedMessage id="content.footer.actions.previous" />
            </small>
            {prev.title}
          </Link>
        )}
        {next && (
          <Link to={next.link} data-next>
            <small>
              <FormattedMessage id="content.footer.actions.next" />
              <IconLeft />
            </small>
            {next.title}
          </Link>
        )}
      </nav>
    </footer>
  );
};

export default ContentFooter;
