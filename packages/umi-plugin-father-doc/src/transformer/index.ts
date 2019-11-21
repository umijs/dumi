import { parseText } from 'sylvanas';
import getYamlConfig from 'umi-build-dev/lib/routes/getYamlConfig';
import remark from './remark';

const FRONT_COMMENT_EXP = /^\n*\/\*[^]+?\s*\*\/\n*/;

export interface TransformResult {
  content: string;
  config: {
    frontmatter: { [key: string]: any };
    [key: string]: any;
  };
}

export default {
  markdown(raw: string, dir: string): TransformResult {
    const result = remark(raw, dir);

    return {
      content: `import React from 'react';export default function () {
        return <>${result.contents}</>;
      }`,
      config: {
        frontmatter: {},
        ...result.data as TransformResult['config'],
      },
    };
  },
  jsx(raw: string): TransformResult {
    return {
      // discard frontmatter for source code display
      content: raw.replace(FRONT_COMMENT_EXP, ''),
      config: {
        frontmatter: getYamlConfig(raw),
      },
    };
  },
  tsx(raw: string): TransformResult {
    const result = this.jsx(raw);

    // parse tsx to jsx for source code display
    result.config.jsx = parseText(raw);

    return result;
  },
}
