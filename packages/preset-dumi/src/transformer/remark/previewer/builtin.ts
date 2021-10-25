import transformer from '../..';
import { getDepsForDemo } from '../../demo';
import type { IDumiElmNode } from '..';
import type { IPreviewerComponentProps } from '../../../theme';
import { encodeHoistImport } from '../../utils';

type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

// refer: https://github.com/microsoft/TypeScript/issues/31153#issuecomment-886674446
type OmitFromKnownKeys<T, K extends keyof T> = KnownKeys<T> extends infer U
  ? keyof U extends keyof T
    ? Pick<T, Exclude<keyof U, K>> & Pick<T, Exclude<keyof T, keyof KnownKeys<T>>>
    : never
  : never;

interface ITransformerPreviewerProps
  extends OmitFromKnownKeys<IPreviewerComponentProps, 'sources'> {
  // override sources type, transformer only need to return { path: string }
  sources: Record<
    string,
    {
      /**
       * absolute path for current file
       */
      path: string;
      /**
       * demo source code, only for code block demo in md
       */
      content?: string;
      /**
       * import statement for current file
       */
      import?: string;
      /**
       * legacy jsx entry file
       * @deprecated
       */
      jsx?: string;
      /**
       * legacy tsx entry file
       * @deprecated
       */
      tsx?: string;
    }
  >;
}

export type IPreviewerTransformerResult = {
  /**
   * render component props;
   */
  rendererProps?: Record<string, any>;
  /**
   * previewer component props
   */
  previewerProps: Partial<ITransformerPreviewerProps>;
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
  let files: ReturnType<typeof getDepsForDemo>['files'] = {};
  let dependencies: ReturnType<typeof getDepsForDemo>['dependencies'] = {};

  // collect third-party dependencies and locale file dependencies for demo
  // FIXME: handle frontmatter in the head of external demo code
  if (!node.properties.meta?.inline) {
    ({ files, dependencies } = getDepsForDemo(node.properties.source, {
      isTSX: /^tsx?$/.test(node.properties.lang),
      fileAbsPath,
    }));
  }

  return {
    // previewer props
    previewerProps: {
      sources: {
        _: {
          [node.properties.lang]: isExternalDemo
            ? encodeHoistImport(node.properties.filePath)
            : transformer.code(node.properties.source).content,
        } as any,
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
