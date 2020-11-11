import path from 'path';
import { Node } from 'unist';
import deepmerge from 'deepmerge';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { parseElmAttrToProps } from './utils';
import parser from '../../api-parser';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { saveFileOnDepChange } from '../../utils/watcher';
import ctx from '../../context';
import { IDumiUnifiedTransformer, IDumiElmNode } from '.';

function applyApiData(identifier: string, definitions: ReturnType<typeof parser>) {
  if (identifier && definitions) {
    ctx.umi?.applyPlugins({
      key: 'dumi.detectApi',
      type: ctx.umi.ApplyPluginsType.event,
      args: {
        identifier,
        data: definitions,
      },
    });
  }
}

/**
 * serialize api node to [title, node, title, node, ...]
 * @param node        original api node
 * @param identifier  api parse identifier, mapping in .umi/dumi/apis.json
 * @param definitions api definitions
 */
function serializeAPINodes(
  node: IDumiElmNode,
  identifier: string,
  definitions: ReturnType<typeof parser>,
) {
  const parsedAttrs = parseElmAttrToProps(node.properties);
  const expts: string[] = parsedAttrs.exports || Object.keys(definitions);

  return expts.reduce<(IDumiElmNode | Node)[]>((list, expt, i) => {
    // render large API title if it is default export
    // or it is the first export and the exports attribute was not custom
    const isInsertAPITitle = expt === 'default' || (!i && !parsedAttrs.exports);
    // render sub title for non-default export
    const isInsertSubTitle = expt !== 'default';
    const apiNode = deepmerge({}, node);

    // insert API title
    if (isInsertAPITitle) {
      list.push(
        {
          type: 'element',
          tagName: 'h2',
          properties: {},
          children: [{ type: 'text', value: 'API' }],
        },
        {
          type: 'text',
          value: '\n',
        },
      );
    }

    // insert export sub title
    if (isInsertSubTitle) {
      list.push(
        {
          type: 'element',
          tagName: 'h3',
          properties: { id: `api-${expt.toLowerCase()}` },
          children: [{ type: 'text', value: expt }],
        },
        {
          type: 'text',
          value: '\n',
        },
      );
    }

    // insert API Node
    delete apiNode.properties.exports;
    apiNode.properties.identifier = identifier;
    apiNode.properties.export = expt;
    apiNode._dumi_parsed = true;
    list.push(apiNode);

    return list;
  }, []);
}

/**
 * remark plugin for parse embed tag to external module
 */
export default function api(): IDumiUnifiedTransformer {
  return (ast, vFile) => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      if (is(node, 'API') && !node._dumi_parsed) {
        let identifier: string;
        let definitions: ReturnType<typeof parser>;

        if (has(node, 'src')) {
          const src = node.properties.src || '';
          // guess component name if src file is index
          const componentName =
            path.parse(src).name === 'index' ? path.basename(path.dirname(src)) : '';
          const absPath = path.join(path.dirname(this.data('fileAbsPath')), src);

          definitions = parser(absPath, componentName);
          identifier = componentName || src;

          // trigger parent markdown file change after this file changed
          saveFileOnDepChange(this.data('fileAbsPath'), absPath);
        } else if (vFile.data.componentName) {
          try {
            const sourcePath = getModuleResolvePath({
              basePath: process.cwd(),
              sourcePath: path.dirname(this.data('fileAbsPath')),
              silent: true,
            });

            definitions = parser(sourcePath, vFile.data.componentName);
            identifier = vFile.data.componentName;
          } catch (err) {
            /* noting */
          }
        }

        if (identifier && definitions) {
          // replace original node
          parent.children.splice(i, 1, ...serializeAPINodes(node, identifier, definitions));

          // apply api data
          applyApiData(identifier, definitions);
        }
      }
    });
  };
}
