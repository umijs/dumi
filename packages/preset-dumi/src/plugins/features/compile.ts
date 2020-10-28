import path from 'path';
import { IApi } from '@umijs/types';
import ctx from '../../context';

/**
 * plugin for compile markdown files
 */
export default (api: IApi) => {
  // exclude .md file for url-loader
  api.modifyDefaultConfig(config => ({
    ...config,
    urlLoaderExcludes: [/\.md$/],
  }));

  // configure loader for .md file
  api.chainWebpack(config => {
    const oPlainTextTest = config.module.rule('plaintext').get('test');
    const babelLoader = config.module
      .rule('js')
      .use('babel-loader')
      .entries();

    // remove md file test from umi
    if (oPlainTextTest?.source?.includes('md')) {
      config.module
        .rule('plaintext')
        .set(
          'test',
          new RegExp(oPlainTextTest.source.replace(/\|md|md\|/, ''), oPlainTextTest.flags),
        );
    }

    // add md file loader
    config.module
      .rule('dumi')
      .test(/\.md$/)
      .use('babel-loader')
      .loader(babelLoader.loader)
      .options(babelLoader.options)
      .end()
      .use('dumi-loader')
      .loader(require.resolve('../../loader'))
      .options({ previewLangs: ctx.opts.resolve.previewLangs });

    return config;
  });

  // watch .md files
  api.addTmpGenerateWatcherPaths(() => [
    ...ctx.opts.resolve.includes.map(key => path.join(api.paths.cwd, key, '**/*.md')),
    ...ctx.opts.resolve.examples.map(key => path.join(api.paths.cwd, key, '*.{tsx,jsx}')),
  ]);
};
