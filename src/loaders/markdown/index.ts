import type { IThemeLoadResult } from '@/features/theme/loader';
import { getFileContentByRegExp, getFileRangeLines } from '@/utils';
import { Mustache } from 'umi/plugin-utils';
import transform, { type IMdTransformerOptions } from './transformer';

interface IMdLoaderDefaultModeOptions
  extends Omit<IMdTransformerOptions, 'fileAbsPath'> {
  mode?: 'markdown';
  builtins: IThemeLoadResult['builtins'];
}

interface IMdLoaderDemosModeOptions
  extends Omit<IMdLoaderDefaultModeOptions, 'builtins' | 'mode'> {
  mode: 'meta';
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
    techStacks: opts.techStacks,
    cwd: opts.cwd,
    fileAbsPath: this.resourcePath,
    codeBlockMode: opts.codeBlockMode,
  }).then((ret) => {
    if (opts.mode === 'meta') {
      const { demos, frontmatter = {} } = ret.meta;

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
`,
          {
            demos,
            frontmatter: JSON.stringify(frontmatter),
            renderAsset: function renderAsset() {
              // use raw-loader to load all source files
              Object.keys(this.sources).forEach((file: string) => {
                this.asset.dependencies[
                  file
                ].value = `{{{require('!!raw-loader!${this.sources[file]}?raw').default}}}`;
              });

              return JSON.stringify(this.asset, null, 2).replace(
                /"{{{|}}}"/g,
                '',
              );
            },
          },
        ),
      );
    } else {
      cb(
        null,
        // import all builtin components, may be used by markdown content
        `${Object.values(opts.builtins)
          .map((item) => `import ${item.specifier} from '${item.source}';`)
          .join('\n')}
import React from 'react';

// export named function for fastRefresh
// ref: https://github.com/pmmmwh/react-refresh-webpack-plugin/blob/main/docs/TROUBLESHOOTING.md#edits-always-lead-to-full-reload
function DumiMarkdownContent() {
  return ${ret.content};
}

export default DumiMarkdownContent;`,
      );
    }
  }, cb);
}
