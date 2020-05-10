import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'algolia',
    config: {
      schema(joi) {
        return joi.object({
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
};
