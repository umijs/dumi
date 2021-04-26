import path from 'path';
import type { IApi } from '@umijs/types';
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
      .options({
        previewLangs: ctx.opts.resolve.previewLangs,
        passivePreview: ctx.opts.resolve.passivePreview
      });

    // set asset type to javascript/auto to skip webpack internal json loader
    // refer: https://webpack.js.org/guides/asset-modules/
    config.module
      .rule('dumi-raw-code')
      // only apply for inline way with query
      .resourceQuery(/dumi\-raw\-code/)
      .type('javascript/auto')
      .use('dumi-raw-code-loader')
      .loader(require.resolve('../../loader/rawCode'));

    // add raw code loader (like raw-loader but without frontmatter)
    config.resolveLoader.alias.set('dumi-raw-code-loader', `${require.resolve('../../loader/rawCode')}`);

    return config;
  });

  // watch .md files
  api.addTmpGenerateWatcherPaths(() => [
    ...ctx.opts.resolve.includes.map(key => path.join(api.paths.cwd, key, '**/*.md')),
    ...ctx.opts.resolve.examples.map(key => path.join(api.paths.cwd, key, '*.{tsx,jsx}')),
  ]);
};
