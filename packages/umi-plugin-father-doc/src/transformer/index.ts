import remark from './remark';

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
  }
}
