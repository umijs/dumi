import { Link, useIntl, useLocale } from 'dumi';
import React, { type FC } from 'react';
import './index.less';

const Page404: FC = () => {
  const intl = useIntl();
  const locale = useLocale();

  return (
    <div className="dumi-default-not-found">
      <h1>{intl.formatMessage({ id: '404.title' })}</h1>
      <Link to={'base' in locale ? locale.base : '/'} replace>
        {intl.formatMessage({ id: '404.back' })} →
      </Link>
    </div>
  );
};

export default Page404;
