import path from 'path';
import * as types from '@babel/types';
import type { IApi } from '@umijs/types';
import type { PluginObj } from '@babel/core';
import ctx from '../../context';

/**
 * babel plugin for replace all layout effect to effect
 */
function dumiIsomorphicReactEffectPlugin(): PluginObj {
  return {
    visitor: {
      // import { useLayoutEffect } from 'react'
      // to
      // import { useEffect as useLayoutEffect } from 'react';
      ImportSpecifier(callPath) {
        const callPathNode = callPath.node;

        if (
          types.isImportDeclaration(callPath.parent) &&
          callPath.parent.source.value === 'react' &&
          callPathNode.local.name === 'useLayoutEffect' &&
          types.isIdentifier(callPathNode.imported) &&
          callPathNode.imported.name === 'useLayoutEffect'
        ) {
          callPath.replaceWith(
            types.importSpecifier(callPathNode.local, types.identifier('useEffect')),
          );
        }
      },
      // React.useLayoutEffect
      // to
      // React.useEffect
      MemberExpression(callPath) {
        const callPathNode = callPath.node;

        if (
          types.isIdentifier(callPathNode.object) &&
          /react/i.test(callPathNode.object.name) &&
          types.isIdentifier(callPathNode.property) &&
          callPathNode.property.name === 'useLayoutEffect'
        ) {
          callPath.replaceWith(
            types.memberExpression(callPathNode.object, types.identifier('useEffect')),
          );
        }
      },
    },
  };
}

/**
 * plugin for compile markdown files
 */
export default (api: IApi) => {
  // exclude .md file for url-loader
  api.modifyDefaultConfig(config => ({
    ...config,
    urlLoaderExcludes: [/\.md$/],
  }));

  // disable babel config file, to avoid library bundle config affecting docs config
  api.modifyBabelOpts(memo => {
    // @ts-ignore
    memo.configFile = false;

    return memo;
  });

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

  // replace all useLayoutEffect to useEffect for ssr
  api.chainWebpack((memo, { type }) => {
    if (type === 'ssr') {
      memo.module
        .rule('js-in-node_modules')
        .use('babel-loader')
        .tap(opts => {
          opts.plugins ??= [];
          opts.plugins.unshift(dumiIsomorphicReactEffectPlugin);

          return opts;
        });
    }

    return memo;
  });

  api.modifyBabelOpts((memo, { type }) => {
    if (type === 'ssr') {
      memo.plugins.unshift(dumiIsomorphicReactEffectPlugin);
    }

    return memo;
  });
};
