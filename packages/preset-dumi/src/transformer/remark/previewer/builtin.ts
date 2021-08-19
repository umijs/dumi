import fs from 'fs';
import transformer from '../..';
import { getDepsForDemo } from '../../demo';
import type { IDumiElmNode } from '..';
import type { IPreviewerComponentProps } from '../../../theme';

export type IPreviewerTransformerResult = {
  /**
   * render component props;
   */
  RendererProps?: Record<string, any>;
  /**
   * previewer component props
   */
  previewerProps: Partial<IPreviewerComponentProps>;
};

export type IPreviewerTransformer = {
  /**
   * transformer type
   * @note  'builtin' means builtin transformer
   */
  type: string;
  /**
   * previewer component file path of current transformer
   * @note  builtin transformer has not this field
   */
  component?: string;
  /**
   * transformer function
   */
  fn: (opts: {
    /**
     * attributes from code HTML tag
     */
    attrs: { src: string; [key: string]: any };
    /**
     * current markdown file path
     */
    mdAbsPath: string;
    /**
     * mdast node
     */
    node: IDumiElmNode;
  }) => IPreviewerTransformerResult;
};

/**
 * builtin previewer transformer
 */
const builtinPreviewerTransformer: IPreviewerTransformer['fn'] = ({ mdAbsPath, node }) => {
  const isExternalDemo = Boolean(node.properties.filePath);
  const fileAbsPath = node.properties.filePath || mdAbsPath;

  // collect third-party dependencies and locale file dependencies for demo
  const { files, dependencies } = getDepsForDemo(node.properties.source, {
    isTSX: /^tsx?$/.test(node.properties.lang),
    fileAbsPath,
  });

  return {
    // previewer props
    previewerProps: {
      sources: {
        [`index.${node.properties.lang}`]: isExternalDemo
          ? { path: node.properties.filePath }
          : { content: transformer.code(node.properties.source).content },
        ...Object.keys(files).reduce(
          (result, file) => ({
            ...result,
            [file]: {
              import: files[file].import,
              path: files[file].fileAbsPath,
            },
          }),
          {},
        ),
      },
      dependencies,
    },
  };
};

export default {
  type: 'builtin',
  fn: builtinPreviewerTransformer,
};
