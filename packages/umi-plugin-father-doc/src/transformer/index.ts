import path from 'upath';
import getYamlConfig from 'umi-build-dev/lib/routes/getYamlConfig';
import remark from './remark';

const FRONT_COMMENT_EXP = /^\n*\/\*[^]+?\s*\*\/\n*/;
const MD_WRAPPER = `
import React from 'react';
import Alert from '${path.join(__dirname, '../themes/default/alert.js')}';
import FatherDocPreviewer from '${path.join(__dirname, '../themes/default/previewer.js')}';

export default function () {
  return <>$CONTENT</>;
}`

export interface TransformResult {
  content: string;
  config: {
    [key: string]: any;
  };
}

export default {
  markdown(raw: string, dir: string): TransformResult {
    const result = remark(raw, dir);
    const contents = (result.contents as string).replace(/class="/g, 'className="');

    return {
      content: MD_WRAPPER.replace('$CONTENT', contents),
      config: {
        ...result.data as TransformResult['config'],
      },
    };
  },
  jsx(raw: string): TransformResult {
    return {
      // discard frontmatter for source code display
      content: raw.replace(FRONT_COMMENT_EXP, ''),
      config: getYamlConfig(raw),
    };
  },
  tsx(raw: string): TransformResult {
    return this.jsx(raw);
  },
}
