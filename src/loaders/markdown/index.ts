import type { IThemeLoadResult } from '@/features/theme/loader';
import { getFileContentByRegExp, getFileRangeLines } from '@/utils';
import { lodash, Mustache } from 'umi/plugin-utils';
import transform, {
  type IMdTransformerOptions,
  type IMdTransformerResult,
} from './transformer';

interface IMdLoaderDefaultModeOptions
  extends Omit<IMdTransformerOptions, 'fileAbsPath'> {
  mode?: 'markdown';
  builtins: IThemeLoadResult['builtins'];
}

interface IMdLoaderDemosModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'meta';
  onResolveDemos?: (demos: IMdTransformerResult['meta']['demos']) => void;
}

export type IMdLoaderOptions =
  | IMdLoaderDefaultModeOptions
  | IMdLoaderDemosModeOptions;

export default function mdLoader(this: any, raw: string) {
  const opts: IMdLoaderOptions = this.getOptions();
  const cb = this.async();

  let content = raw;
  const params = new URLSearchParams(this.resourceQuery);
  const range = params.get('range');
  const regexp = params.get('regexp');
  // extract content of markdown file
  if (range) {
    content = getFileRangeLines(content, range);
  } else if (regexp) {
    content = getFileContentByRegExp(content, regexp, this.resourcePath);
  }

  transform(content, {
    ...(lodash.omit(opts, ['mode', 'builtins']) as Omit<
      IMdLoaderOptions,
      'mode' | 'builtins'
    >),
    fileAbsPath: this.resourcePath,
  }).then((ret) => {
    if (opts.mode === 'meta') {
      const { demos, frontmatter, toc, texts, embeds = [] } = ret.meta;

      // declare embedded files as loader dependency, for clear cache when file changed
      embeds.forEach((file) => this.addDependency(file));

      // apply demos resolve hook
      if (demos && opts.onResolveDemos) {
        opts.onResolveDemos(demos);
      }

      cb(
        null,
        Mustache.render(
          `import React from 'react';

export const demos = {
  {{#demos}}
  '{{{id}}}': {
    component: {{{component}}},
    asset: {{{renderAsset}}}
  },
  {{/demos}}
};
export const frontmatter = {{{frontmatter}}};
export const toc = {{{toc}}};
export const texts = {{{texts}}};
`,
          {
            demos,
            frontmatter: JSON.stringify(frontmatter),
            toc: JSON.stringify(toc),
            texts: JSON.stringify(texts),
            renderAsset: function renderAsset(
              this: NonNullable<typeof demos>[0],
            ) {
              // do not render asset for inline demo
              if (!('asset' in this)) return 'null';

              // render asset for normal demo
              let { asset } = this;
              const { sources } = this;

              // use raw-loader to load all source files
              Object.keys(this.sources).forEach((file: string) => {
                // to avoid modify original asset object
                asset = lodash.cloneDeep(asset);
                asset.dependencies[
                  file
                ].value = `{{{require('!!raw-loader!${sources[file]}?raw').default}}}`;
              });

              return JSON.stringify(asset, null, 2).replace(/"{{{|}}}"/g, '');
            },
          },
        ),
      );
    } else {
      // do not wrap DumiPage for fragment content (tab, embed)
      const isFragment = Boolean(
        this.resourcePath.includes('$tab-') || this.resourceQuery,
      );

      cb(
        null,
        // import all builtin components, may be used by markdown content
        `${Object.values(opts.builtins)
          .map((item) => `import ${item.specifier} from '${item.source}';`)
          .join('\n')}
import React from 'react';${
          isFragment ? '' : `\nimport { DumiPage } from 'dumi'`
        }

// export named function for fastRefresh
// ref: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md#edits-always-lead-to-full-reload
function DumiMarkdownContent() {
  return ${isFragment ? ret.content : `<DumiPage>${ret.content}</DumiPage>`};
}

export default DumiMarkdownContent;`,
      );
    }
  }, cb);
}
