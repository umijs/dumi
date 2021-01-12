import fs from 'fs';
import path from 'path';
import type { IApi } from '@umijs/types';
import { SitemapStream } from 'sitemap';
import ctx from '../../context';

/**
 * plugin for generate sitemap.xml for doc site
 */
export default (api: IApi) => {
  api.describe({
    key: 'sitemap',
    config: {
      schema(joi) {
        return joi.object({
          hostname: joi.string().required(),
          excludes: joi.array().items(joi.string()),
        });
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  if (api.env === 'production' && api.userConfig.sitemap && !ctx.opts.isIntegrate) {
    api.onBuildComplete(async () => {
      const smis = new SitemapStream({
        hostname: api.config.sitemap.hostname,
        xmlns: { video: false, image: false, news: false, xhtml: false },
      });
      const { routes } = await api.applyPlugins({
        key: 'dumi.getRootRoute',
        type: api.ApplyPluginsType.modify,
        initialValue: await api.getRoutes(),
      });
      const excludes = ['/404'].concat(api.config.sitemap.excludes);
      const writeStream = fs.createWriteStream(path.join(api.paths.absOutputPath, 'sitemap.xml'));

      smis.pipe(writeStream);

      routes.forEach(route => {
        if (
          // ignore specific paths
          !excludes.includes(route.path) &&
          // ignore dynamic route, such as /~demos/:uuid
          !route.path.includes(':')
        ) {
          smis.write({ url: route.path });
        }
      });

      smis.end();
      await new Promise(resolve => writeStream.on('close', resolve));

      api.logger.info('sitemap.xml generated successfully!');
    });
  }
};
