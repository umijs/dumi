import { SP_ROUTE_PREFIX } from '@/constants';
import type { IApi } from '@/types';
import path from 'path';
import { winPath } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    config: {
      default: [
        {
          id: 'zh-CN',
          name: '中文',
          // only apply default base for non-suffix mode
          ...(api.userConfig.locales?.[0] &&
          'suffix' in api.userConfig.locales[0]
            ? {}
            : { base: '/' }),
        },
      ],
      schema: (Joi) => {
        const basicOpts = { id: Joi.string(), name: Joi.string() };

        return Joi.alternatives(
          // base mode
          Joi.array().items(
            Joi.object({
              ...basicOpts,
              base: Joi.string().optional(),
            }),
          ),
          // suffix mode
          Joi.array().items(
            Joi.object({
              ...basicOpts,
              suffix: Joi.string().allow(''),
            }),
          ),
        );
      },
    },
  });

  api.onCheck(() => {
    // check locales config
    if (api.config.locales) {
      // other locale must set base to /
      api.config.locales.slice(1).forEach((locale) => {
        if ('base' in locale && locale.base === '/') {
          assert(
            false,
            `Only the first locale item is allowed to set base: '/', you can move ${locale.id} to the front as default locale. See more: See https://d.umijs.org/config#locales`,
          );
        }
      });
    }
  });

  api.register({
    key: 'modifyConfig',
    stage: Infinity,
    fn: (memo: IApi['config']) => {
      // fallback to use id as locale route base
      memo.locales?.forEach((locale, i) => {
        if (!('suffix' in locale)) {
          // only apply for non-suffix mode
          locale.base ??= i ? `/${locale.id}` : '/';
        }
      });

      return memo;
    },
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/locales/config.ts',
      content: `export const locales = ${JSON.stringify(
        api.config.locales,
        null,
        2,
      )};
export const messages = ${JSON.stringify(
        api.service.themeData.locales,
        null,
        2,
      )};`,
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/locales/runtime.tsx',
      content: `
import { history } from 'dumi';
import React, { useState, useLayoutEffect, useCallback, type ReactNode } from 'react';
import { RawIntlProvider, createIntl, createIntlCache } from '${winPath(
        path.dirname(require.resolve('react-intl/package')),
      )}';
import { useIsomorphicLayoutEffect } from '${winPath(
        require.resolve('../client/theme-api/utils'),
      )}'
import { locales, messages } from './config';

const cache = createIntlCache();

const LocalesContainer: FC<{ children: ReactNode }> = (props) => {
  const getIntl = useCallback(() => {
    const base = "${api.config.base!.replace(/\/$/, '')}"
    const matched = locales.slice().reverse().find((locale) => (
      'suffix' in locale
        // suffix mode
        ? history.location.pathname.replace(/([^/])\\/$/, '$1').endsWith(locale.suffix)
        // base mode
        : history.location.pathname.replace(/([^/])\\/$/, '$1')
          .startsWith(base + locale.base)
    ));
    let locale = matched ? matched.id : locales[0].id;
    // using query on demos
    if(history.location.pathname.startsWith(base + '/${SP_ROUTE_PREFIX}demos')){
        const params = new URLSearchParams(history.location.search);
        // match the locale of the query
        if (params.get('locale')){
          locale = params.get('locale');
        }
    }
    const localeMessages = messages[locale] || {};

    // append internal message, for use intl as string template util
    localeMessages['$internal.edit.link'] = ${JSON.stringify(
      api.config.themeConfig.editLink,
    )};

    return createIntl({ locale, messages: localeMessages }, cache);
  }, []);
  const [intl, setIntl] = useState(() => getIntl());

  useIsomorphicLayoutEffect(() => {
    return history.listen(() => {
      setIntl(getIntl());
    });
  }, []);

  return <RawIntlProvider value={intl} key={intl.locale}>{props.children}</RawIntlProvider>;
}

export function i18nProvider(container: Element) {
  return React.createElement(LocalesContainer, null, container);
}
`,
    });
  });

  api.addRuntimePlugin(() => '@@/dumi/locales/runtime.tsx');
};
