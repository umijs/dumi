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
}`;

export interface TransformResult {
  content: string;
  config: {
    [key: string]: any;
  };
}

export default {
  /**
   * transform markdown content to jsx & meta data
   * @param raw         content
   * @param fileAbsDir  absolute path of markdown file
   * @param onlyConfig  whether transform meta data only
   */
  markdown(raw: string, fileAbsDir: string, onlyConfig?: boolean): TransformResult {
    const result = remark(raw, { fileAbsDir, strategy: onlyConfig ? 'data' : 'default' });
    let content = '';

    if (!onlyConfig) {
      // convert class to className for jsx
      // Todo: process in a Unified way
      content = (result.contents as string).replace(/class="/g, 'className="');

      // wrap by page component
      content = MD_WRAPPER.replace('$CONTENT', content);
    }

    return {
      content,
      config: {
        ...(result.data as TransformResult['config']),
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
};
