import { useIntl, useLocale, useLocation, useSiteData } from 'dumi';
import React, { useEffect, useState, type FC } from 'react';
import './index.less';

type ILocaleItem = ReturnType<typeof useSiteData>['locales'][0];

function getTargetLocalePath({
  pathname,
  current,
  target,
}: {
  pathname: string;
  current: ILocaleItem;
  target: ILocaleItem;
}) {
  const clearPath =
    'base' in current
      ? pathname.replace(current.base.replace(/\/$/, ''), '')
      : pathname.replace(new RegExp(`${current.suffix}$`), '');

  return 'base' in target
    ? `${target.base}${clearPath}`.replace(/^\/\//, '/')
    : `${clearPath}${target.suffix}`;
}

const SingleSwitch: FC<{ locale: ILocaleItem }> = ({ locale }) => {
  const { pathname } = useLocation();
  const current = useLocale();
  const [path, setPath] = useState(() =>
    getTargetLocalePath({ pathname, current, target: locale }),
  );

  useEffect(() => {
    setPath(getTargetLocalePath({ pathname, current, target: locale }));
  }, [pathname, current.id, locale.id]);

  // TODO: use Link (without page refresh)
  return (
    <a className="dumi-default-lang-switch" href={path}>
      {locale.name}
    </a>
  );
};

const LangSwitch: FC = () => {
  const { locales } = useSiteData();
  const { locale } = useIntl();

  // do not render in single language
  if (locales.length <= 1) return null;

  return locales.length > 2 ? (
    // TODO: multiple languages select
    <>WIP</>
  ) : (
    // single language switch
    <SingleSwitch locale={locales.find(({ id }) => id !== locale)!} />
  );
};

export default LangSwitch;
