import path from 'path';
import type { IApi } from '@umijs/types';
import { setOptions } from '../../context';
import getHostPkgAlias from '../../utils/getHostPkgAlias';

export default (api: IApi) => {
  const hostPkgAlias = getHostPkgAlias(api.paths);

  api.describe({
    key: 'resolve',
    config: {
      default: {},
      schema(joi) {
        return joi.object();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('resolve', {
      previewLangs: memo.resolve.previewLangs || ['jsx', 'tsx'],
      // default to include src, lerna pkg's src & docs folder
      includes:
        memo.resolve.includes ||
        hostPkgAlias
          .map(([_, pkgPath]) => path.relative(api.paths.cwd, path.join(pkgPath, 'src')))
          .concat(['docs']),
      examples: memo.resolve.examples || ['examples'],
      passivePreview: memo.resolve.passivePreview || false,
      excludes: memo.resolve.excludes || []
    });

    return memo;
  });
};
