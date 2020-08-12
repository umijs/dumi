import React, { FC, useContext } from 'react';
// @ts-ignore
import { history } from 'dumi';
import { context } from 'dumi/theme';
import './LocaleSelect.less';

const LocaleSelect: FC = () => {
  const {
    locale,
    config: { locales },
  } = useContext(context);
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
            {locales.map(localeItem => (
              <option value={localeItem.name} key={localeItem.name}>
                {localeItem.label}
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
