import path from 'path';
import type { Node } from 'unist';
import deepmerge from 'deepmerge';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import visit from 'unist-util-visit';
import { parseElmAttrToProps } from './utils';
import parser from '../../api-parser';
import { getModuleResolvePath } from '../../utils/moduleResolver';
import { listenFileOnceChange } from '../../utils/watcher';
import ctx from '../../context';
import type { IApiExtraElement } from '../../api-parser';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';

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
 * detect component name via file path
 */
function guessComponentName(fileAbsPath: string) {
  const parsed = path.parse(fileAbsPath);

  if (parsed.name === 'index') {
    // button/index.tsx => button
    // packages/button/src/index.tsx => button
    // windows: button\\src\\index.tsx
    return path.basename(parsed.dir.replace(/\/src$|\\src$/, ''));
  }

  // components/button.tsx => button
  return parsed.name;
}

/**
 * watch component change to update api data
 * @param absPath       component absolute path
 * @param componentName component name
 * @param identifier    api identifier
 * @param parseOpts    extra parse options
 */
function watchComponentUpdate(absPath: string, componentName: string, identifier: string, parseOpts: IApiExtraElement) {
  listenFileOnceChange(absPath, () => {
    let definitions: ReturnType<typeof parser>;

    try {
      definitions = parser(absPath, parseOpts, componentName);
    } catch (err) {
      /* noting */
    }

    // update api data
    applyApiData(identifier, definitions);

    // watch next turn
    watchComponentUpdate(absPath, componentName, identifier, parseOpts);
  });
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
        const parseOpts = parseElmAttrToProps(node.properties);
        if (has(node, 'src')) {
          const src = node.properties.src || '';
          const absPath = path.join(path.dirname(this.data('fileAbsPath')), src);
          // guess component name if there has no identifier property
          const componentName = node.properties.identifier || guessComponentName(absPath);
          definitions = parser(absPath, parseOpts, componentName);
          identifier = componentName || src;

          // trigger listener to update previewer props after this file changed
          watchComponentUpdate(absPath, componentName, identifier, parseOpts);
        } else if (vFile.data.componentName) {
          try {
            const sourcePath = getModuleResolvePath({
              basePath: process.cwd(),
              sourcePath: path.dirname(this.data('fileAbsPath')),
              silent: true,
            });
            definitions = parser(sourcePath, parseOpts, vFile.data.componentName);
            identifier = vFile.data.componentName;

            // trigger listener to update previewer props after this file changed
            watchComponentUpdate(sourcePath, vFile.data.componentName, identifier, parseOpts);
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
