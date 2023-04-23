import type { IApi } from '@/types';
import { getSchemas } from './schema';

export default (api: IApi) => {
  const configDefaults: Record<string, any> = {
    resolve: {
      docDirs: ['docs'],
      atomDirs: [{ type: 'component', dir: 'src' }],
      codeBlockMode: 'active',
      forceKebabCaseRouting: true,
    },
    themeConfig: {
      footer: `Copyright © ${new Date().getFullYear()} | Powered by <a href="https://d.umijs.org" target="_blank" rel="noreferrer">dumi</a>`,
      prefersColor: { default: 'light', switch: true },
    },
  };

  const schemas = getSchemas();
  for (const key of Object.keys(schemas)) {
    const config: Record<string, any> = {
      schema: schemas[key] || ((joi: any) => joi.any()),
    };
    if (key in configDefaults) {
      config.default = configDefaults[key];
    }
    api.registerPlugins([
      {
        id: `virtual: config-${key}`,
        key: key,
        config,
      },
    ]);
  }
};
