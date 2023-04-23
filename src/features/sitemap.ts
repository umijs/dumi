import type { IApi } from '@/types';
import fs from 'fs';
import path from 'path';
import { SitemapStream } from 'sitemap';
import type { IRoute } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'sitemap',
    config: {
      schema(joi) {
        return joi.object({
          hostname: joi.string().required(),
          exclude: joi.array().items(joi.string()),
        });
      },
    },
    enableBy: ({ userConfig, env }) =>
      userConfig.sitemap && env === 'production',
  });

  api.onBuildComplete(async () => {
    const smis = new SitemapStream({
      hostname: api.config.sitemap!.hostname,
      xmlns: { video: false, image: false, news: false, xhtml: false },
    });
    const exclude = ['/404'].concat(api.config.sitemap!.exclude || []);
    const writeStream = fs.createWriteStream(
      path.join(api.paths.absOutputPath, 'sitemap.xml'),
    );

    smis.pipe(writeStream);

    Object.values<IRoute>(api.appData.routes).forEach((route) => {
      if (
        // ignore specific paths
        !exclude.includes(route.path) &&
        // ignore dynamic route, such as /~demos/:uuid
        ![':', '*'].some((char) => route.path.includes(char))
      ) {
        smis.write({ url: route.path });
      }
    });

    smis.end();
    await new Promise((resolve) => {
      writeStream.on('close', resolve);
    });
  });
};
