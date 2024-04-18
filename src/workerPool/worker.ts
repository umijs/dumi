import { runLoaders } from '@/features/okam/promisifyLoaderRunner';
import ReactTechStack from '@/techStacks/react';
import fs from 'fs';
import querystring from 'querystring';
import url from 'url';
import workerpool from 'workerpool';

const techStacks = [new ReactTechStack()];

const mdLoader = {
  render: async (filePath: string, loaderBaseOpts) => {
    const requestUrl = url.parse(filePath);
    const mdLoaderPath = require.resolve('../loaders/markdown');

    const query = querystring.parse(requestUrl.query!);

    if (/\..+$/.test(filePath)) {
      if (requestUrl.query?.includes('techStack')) {
        const result = await runLoaders({
          resource: filePath,
          loaders: [
            {
              loader: require.resolve('../loaders/demo'),
              options: { techStacks, cwd: loaderBaseOpts.cwd },
            },
          ],
        });
        return { content: result.result![0], type: 'js' };
      }
    }

    if (/\.(j|t)sx?\?type=frontmatter$/.test(filePath)) {
      const result = await runLoaders({
        resource: filePath,
        loaders: [
          {
            loader: require.resolve('../loaders/page'),
            options: {},
          },
        ],
      });
      return { content: result.result![0], type: 'js' };
    }

    if (requestUrl.pathname?.endsWith('.md')) {
      let options;
      const { builtins } = loaderBaseOpts;
      loaderBaseOpts.techStacks = techStacks;
      if (query.type === 'demo-index') {
        options = {
          ...loaderBaseOpts,
          mode: 'demo-index',
        };
      } else if (query.type === 'frontmatter') {
        options = {
          ...loaderBaseOpts,
          mode: 'frontmatter',
        };
      } else if (query.type === 'text') {
        options = {
          ...loaderBaseOpts,
          mode: 'text',
        };
      } else if (query.type === 'demo') {
        options = {
          ...loaderBaseOpts,
          mode: 'demo',
        };
      } else {
        options = {
          ...loaderBaseOpts,
          builtins,
        };
      }
      const result = await runLoaders({
        resource: filePath,
        loaders: [
          {
            loader: mdLoaderPath,
            options,
          },
        ],
        context: {},
        readResource: fs.readFile.bind(fs),
      });
      return {
        content: result.result![0],
        type: 'js',
      };
    }

    if (requestUrl.query?.includes('dumi-raw')) {
      const result = await runLoaders({
        resource: filePath,
        loaders: [
          {
            loader: require.resolve('raw-loader'),
            options: {},
          },
          {
            loader: require.resolve('../loaders/pre-raw'),
            options: {},
          },
        ],
      });
      return {
        content: result.result![0],
        type: 'js',
      };
    }
  },
};

workerpool.worker(mdLoader);
