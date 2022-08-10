import { Mustache } from 'umi/plugin-utils';
import transform, { type IMdTransformerOptions } from './transformer';

export interface IMdLoaderOptions
  extends Omit<IMdTransformerOptions, 'fileAbsPath'> {
  mode?: 'markdown' | 'demos';
}

export default function mdLoader(this: any, raw: string) {
  const opts: IMdLoaderOptions = this.getOptions();
  const cb = this.async();

  transform(raw, {
    techStacks: opts.techStacks,
    cwd: opts.cwd,
    fileAbsPath: this.resourcePath,
  }).then((ret) => {
    if (opts.mode === 'demos') {
      cb(
        null,
        Mustache.render(
          `import React from 'react';

export default {
  {{#demos}}
  '{{{id}}}': {{{component}}},
  {{/demos}}
}`,
          { demos: ret.meta.demos },
        ),
      );
    } else {
      cb(
        null,
        `import { DumiDemo } from 'dumi/theme';

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
