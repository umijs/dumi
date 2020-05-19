import path from 'path';
import yaml from 'js-yaml';
import slash from 'slash2';
import extractComments from 'esprima-extract-comments';
import remark from './remark';
import html from './html';
import demo, { getDepsForDemo } from './demo';
import FileCache from '../utils/cache';

const FRONT_COMMENT_EXP = /^\n*\/\*[^]+?\s*\*\/\n*/;
const markdownCache = new FileCache();

export interface TransformResult {
  content: string;
  html?: string;
  config: {
    [key: string]: any;
  };
}

// From: https://github.com/umijs/umi/blob/master/packages/umi-build-dev/src/routes/getYamlConfig.js
function getYamlConfig(code, componentFile = '') {
  const comments = extractComments(code);

  return comments
    .slice(0, 1)
    .filter(c => c.value.includes(':') && c.loc.start.line === 1)
    .reduce((memo, item) => {
      const { value } = item;
      const v = value.replace(/^(\s+)?\*/gm, '');

      try {
        const yamlResult = yaml.safeLoad(v);
        return {
          ...memo,
          ...yamlResult,
        };
      } catch (e) {
        console.warn(`Annotation fails to parse - ${componentFile}: ${e}`);
      }
      return memo;
    }, {});
}

function wrapperHtmlByComponent(jsx: string, meta: TransformResult['config']) {
  return `
    import { Link } from 'umi';
    import React from 'react';
    import Alert from '${slash(path.join(__dirname, '../themes/default/builtins/Alert.js'))}';
    import Badge from '${slash(path.join(__dirname, '../themes/default/builtins/Badge.js'))}';
    import SourceCode from '${slash(
      path.join(__dirname, '../themes/default/builtins/SourceCode.js'),
    )}';
    import DumiPreviewer from '${slash(
      path.join(__dirname, '../themes/default/builtins/Previewer.js'),
    )}';

    ${(meta.demos || []).join('\n')}

    export default function () {
      return (
        <>
          ${
            meta.translateHelp
              ? "<Alert>This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.</Alert>"
              : ''
          }
          ${jsx}
        </>
      );
  }`;
}

export default {
  /**
   * transform markdown content to jsx & meta data
   * @param raw         content
   * @param opts        transform options
   * @param fileAbsPath  absolute path of markdown file
   * @param onlyConfig  whether transform meta data only
   */
  markdown(
    raw: string,
    opts: { fileAbsPath?: string; onlyConfig?: boolean; previewLangs?: string[] } = {},
  ): TransformResult {
    const result =
      // use cache first, for HMR performance
      (opts.onlyConfig && markdownCache.get(opts.fileAbsPath)) ||
      remark(raw, {
        fileAbsPath: opts.fileAbsPath,
        strategy: opts.onlyConfig ? 'data' : 'default',
        previewLangs: opts.previewLangs || [],
      });
    const { demos, ...metas } = result.data as any;
    let content = '';

    if (opts.fileAbsPath) {
      markdownCache.add(opts.fileAbsPath, result);
    }

    if (!opts.onlyConfig) {
      // transform html string to jsx string
      content = this.html(result.contents as string);

      // wrap by page component
      content = wrapperHtmlByComponent(content, result.data);
    }

    return {
      content,
      html: result.contents as string,
      config: {
        ...(metas as TransformResult['config']),
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
  /**
   * transform html string to jsx string
   * @param raw   html string
   */
  html(raw: string): TransformResult {
    return html(raw);
  },
  /**
   * transform code block (j|t)sx demo to js
   */
  demo(raw: string, opts: { isTSX: boolean; fileAbsPath: string }): TransformResult {
    const { content, ast } = demo(raw, opts);
    const deps = getDepsForDemo(ast, opts);

    return {
      content,
      config: deps,
    };
  },
};
