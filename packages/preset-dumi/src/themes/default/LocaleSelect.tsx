import React, { FC, useContext } from 'react';
import { history } from 'umi';
import context from './context';
import './LocaleSelect.less';

const LocaleSelect: FC = () => {
  const { locales, locale } = useContext(context);
  const firstDiffLocale = locales.find(({ name }) => name !== locale);

  function handleLocaleChange(ev) {
    let newPathname = history.location.pathname.replace(`/${locale}`, '');

    // append locale prefix to path if it is not the default locale
    if (ev.target.value !== locales[0].name) {
      newPathname = `/${ev.target.value}${newPathname}`.replace(/\/$/, '');
    }

    history.push(newPathname);
  }

  return (
    Boolean(locales.length) && (
      <div className="__dumi-default-locale-select" data-locale-count={locales.length}>
        {locales.length > 2 ? (
          <select value={locale} onChange={handleLocaleChange}>
            {locales.map(locale => (
              <option value={locale.name} key={locale.name}>
                {locale.label}
              </option>
            ))}
          </select>
        ) : (
          <span onClick={() => handleLocaleChange({ target: { value: firstDiffLocale.name } })}>
            {firstDiffLocale.label}
          </span>
        )}
      </div>
    )
  );
};

export default LocaleSelect;
