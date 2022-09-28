import type { IApi } from '@/types';

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
import React, { useState, type ReactNode } from 'react';
import { RawIntlProvider, createIntl, createIntlCache } from 'react-intl';
import { locales, messages } from './config';

const cache = createIntlCache();

const LocalesContainer: FC<{ children: ReactNode }> = (props) => {
  const [locale] = useState(() => {
    const matched = locales.slice().reverse().find((locale) => (
      'suffix' in locale
        // suffix mode
        ? history.location.pathname.endsWith(locale.suffix)
        // base mode
        : history.location.pathname.startsWith(locale.base)
    ));

    return matched ? matched.id : locales[0].id;
  });
  const [intl] = useState(() => createIntl({ locale, messages: messages[locale] || {} }, cache));

  return <RawIntlProvider value={intl}>{props.children}</RawIntlProvider>;
}

export function i18nProvider(container: Element) {
  return React.createElement(LocalesContainer, null, container);
}
`,
    });
  });

  api.addRuntimePlugin(() => '@@/dumi/locales/runtime.tsx');
};
