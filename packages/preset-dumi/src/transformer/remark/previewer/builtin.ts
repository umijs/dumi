import fs from 'fs';
import transformer from '../..';
import { getDepsForDemo } from '../../demo';
import { decodeHoistImportToContent, encodeHoistImport } from '../../utils';
import type { ExampleBlockAsset } from 'dumi-assets-types';
import type { IDumiElmNode } from '..';
import type { IPreviewerComponentProps } from '../../../theme';

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
  }) => {
    /**
     * previewer component props
     */
    props: Record<string, any>;
    /**
     * dependencies for block example assets meta data
     */
    dependencies: ExampleBlockAsset['dependencies'];
    /**
     * all dependent files, use to watch changes
     */
    dependentFiles?: string[];
  };
};

/**
 * transform meta data for node
 * @param meta  node meta data from attribute & frontmatter
 */
function transformNodeMeta(meta: Record<string, any>) {
  Object.keys(meta).forEach(key => {
    const matched = key.match(/^desc(?:(\.[\w-]+$)|$)/);

    // compatible with short-hand usage for description field in previous dumi versions
    if (matched) {
      key = `description${matched[1] || ''}`;
      meta[key] = meta[matched[0]];
      delete meta[matched[0]];
    }

    // transform markdown for description field
    if (/^description(\.|$)/.test(key)) {
      meta[key] = transformer.markdown(meta[key], null, {
        type: 'html',
      }).content;
    }
  });

  return meta;
}

/**
 * builtin previewer transformer
 */
const builtinPreviewerTransformer: IPreviewerTransformer['fn'] = ({ mdAbsPath, node }) => {
  const isExternalDemo = Boolean(node.properties.filePath);
  const fileAbsPath = node.properties.filePath || mdAbsPath;

  // read frontmatter for external demo
  if (isExternalDemo) {
    const { meta, content } = transformer.code(
      fs.readFileSync(node.properties.filePath, 'utf8').toString(),
    );

    node.properties.source = content;
    // save original attr meta on code tag, to avoid node meta override frontmatter in HMR
    node.properties._ATTR_META = node.properties._ATTR_META || node.properties.meta;
    node.properties.meta = Object.assign(meta, node.properties._ATTR_META);
  }

  // transform node meta data
  node.properties.meta = transformNodeMeta(node.properties.meta);

  // collect third-party dependencies and locale file dependencies for demo
  const { files, dependencies } = getDepsForDemo(node.properties.source, {
    isTSX: /^tsx?$/.test(node.properties.lang),
    fileAbsPath,
  });

  // generate previewer props
  const props = {
    // source code data
    sources: {
      [`index.${node.properties.lang}`]: {
        content: isExternalDemo
          ? encodeHoistImport(node.properties.filePath)
          : node.properties.source,
      },
      ...Object.keys(files).reduce(
        (result, file) => ({
          ...result,
          [file]: {
            import: files[file].import,
            content: encodeHoistImport(files[file].fileAbsPath),
          },
        }),
        {} as IPreviewerComponentProps['sources'],
      ),
    },
    // third-party dependencies data
    dependencies,
  };

  return {
    // previewer props
    props,
    // block example asset value, for generate assets.json
    dependencies: {
      // append npm dependencies
      ...Object.entries(dependencies).reduce(
        (deps, [pkg, { version }]) =>
          Object.assign(deps, {
            [pkg]: {
              type: 'NPM',
              // TODO: get real version rule from package.json
              value: version,
            },
          }),
        {},
      ),
      // append local file dependencies
      ...Object.entries(props.sources).reduce(
        (result, [file, { content }]) =>
          Object.assign(result, {
            [file]: {
              type: 'FILE',
              value:
                file === `index.${node.properties.lang}`
                  ? // strip frontmatter for main file
                    transformer.code(decodeHoistImportToContent(content)).content
                  : decodeHoistImportToContent(content),
            },
          }),
        {},
      ),
    },
    // return all imported files, use to watch change
    dependentFiles: Object.values(files).map(({ fileAbsPath: val }) => val),
  };
};

export default {
  type: 'builtin',
  fn: builtinPreviewerTransformer,
};
