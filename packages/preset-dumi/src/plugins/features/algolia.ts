import type { IApi } from '@umijs/types';
import { setOptions } from '../../context';

/**
 * plugin for enable algolia search engine
 */
export default (api: IApi) => {
  api.describe({
    key: 'algolia',
    config: {
      schema(joi) {
        return joi.object({
          appId: joi.string(),
          apiKey: joi.string().required(),
          indexName: joi.string().required(),
          debug: joi.boolean(),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  const { algolia } = api.userConfig;

  if (algolia) {
    api.addHTMLLinks(() => [
      {
        href: 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css',
        rel: 'stylesheet',
      },
    ]);

    api.addHTMLScripts(() => [
      {
        src: 'https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js',
      },
    ]);
  }

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('algolia', memo.algolia);

    return memo;
  });
};
