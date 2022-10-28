import fs from 'fs';
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
import type { ArgsType } from '@umijs/utils';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';

import { TypescriptParser, ClassLikeDeclaration } from 'typescript-parser';
import { AtomPropsDefinition } from 'dumi-assets-types';

const tparser = new TypescriptParser();

function applyEntityData(identifier: string, definitions: ReturnType<typeof parser>) {
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
function serializeEntityNodes(
  node: IDumiElmNode,
  identifier: string,
  definitions: ReturnType<typeof parser>,
) {
  const parsedAttrs = parseElmAttrToProps(node.properties);
  const expts: string[] = parsedAttrs.exports || Object.keys(definitions);
  const showTitle = !parsedAttrs.hideTitle;

  return expts.reduce<(IDumiElmNode | Node)[]>((list, expt, i) => {
    // render large API title if it is default export
    // or it is the first export and the exports attribute was not custom

    const isInsertAPITitle = expt === 'default' || (!i && !parsedAttrs.exports);
    // render sub title for non-default export
    const isInsertSubTitle = expt !== 'default';
    const entityNode = deepmerge({}, node);

    // insert API title
    if (showTitle && isInsertAPITitle) {
      list.push(
        {
          type: 'element',
          tagName: 'h2',
          properties: {},
          children: [{ type: 'text', value: '其他实体类型定义' }],
        },
        {
          type: 'text',
          value: '\n',
        },
      );
    }

    // insert export sub title
    if (showTitle && isInsertSubTitle) {
      list.push(
        {
          type: 'element',
          tagName: 'h3',
          properties: { id: `entity-${expt.toLowerCase()}` },
          children: [{ type: 'text', value: expt }],
        },
        {
          type: 'text',
          value: '\n',
        },
      );
    }

    // insert API Node
    delete entityNode.properties.exports;
    entityNode.properties.identifier = identifier;
    entityNode.properties.export = expt;

    entityNode._dumi_parsed = true;
    list.push(entityNode);

    return list;
  }, []);
}

/**
 * detect component name via file path
 */
function guessComponentName(fileAbsPath: string) {
  const parsed = path.parse(fileAbsPath);

  if (['index', 'index.d'].includes(parsed.name)) {
    // button/index.tsx => button
    // packages/button/src/index.tsx => button
    // packages/button/lib/index.d.ts => button
    // windows: button\\src\\index.tsx => button
    // windows: button\\lib\\index.d.ts => button
    return path.basename(parsed.dir.replace(/(\/|\\)(src|lib)$/, ''));
  }

  // components/button.tsx => button
  return parsed.name;
}

/**
 * watch component change to update api data
 * @param absPath       component absolute path
 * @param identifier    api identifier
 * @param parseOpts     extra parse options
 */
function watchComponentUpdate(
  absPath: string,
  identifier: string,
  parseOpts: ArgsType<typeof parser>[1],
) {
  listenFileOnceChange(absPath, () => {
    let definitions: ReturnType<typeof parser>;

    try {
      definitions = parseDefinitions(absPath);
    } catch (err) {
      /* noting */
    }

    // update api data
    applyEntityData(identifier, definitions);

    // watch next turn
    // FIXME: workaround for resolve no such file error
    /* istanbul ignore next */
    setTimeout(
      () => {
        watchComponentUpdate(absPath, identifier, parseOpts);
      },
      fs.existsSync(absPath) ? 0 : 50,
    );
  });
}

/**
 * remark plugin for parse embed tag to external module
 */
export default function entity(): IDumiUnifiedTransformer {
  return (ast, vFile) => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      if (is(node, 'Entity') && !node._dumi_parsed) {
        let identifier: string;
        let definitions: ReturnType<typeof parser>;
        const parseOpts = parseElmAttrToProps(node.properties);
        // console.log('parseOpts', parseOpts)

        if (has(node, 'src')) {
          const src = node.properties.src || '';
          let absPath = path.join(path.dirname(this.data('fileAbsPath')), src);
          try {
            absPath = getModuleResolvePath({
              basePath: process.cwd(),
              sourcePath: src,
              silent: true,
            });
          } catch (err) {
            // nothing
          }
          // guess component name if there has no identifier property
          const componentName = node.properties.identifier || guessComponentName(absPath);

          parseOpts.componentName = componentName;
          identifier = 'entity-' + componentName || src;
          definitions = parseDefinitions(absPath)

          // trigger listener to update previewer props after this file changed
          watchComponentUpdate(absPath, identifier, parseOpts);
        } else if (vFile.data.componentName) {
          try {
            const sourcePath = getModuleResolvePath({
              basePath: process.cwd(),
              sourcePath: path.dirname(this.data('fileAbsPath')),
              silent: true,
            });

            parseOpts.componentName = vFile.data.componentName;

            definitions = parseDefinitions(sourcePath);
            identifier = 'entity-' + vFile.data.componentName;

            // trigger listener to update previewer props after this file changed
            watchComponentUpdate(sourcePath, identifier, parseOpts);
          } catch (err) {
            /* noting */
          }
        }

        if (identifier && definitions) {
          // replace original node
          parent.children.splice(i, 1, ...serializeEntityNodes(node, identifier, definitions));

          // apply api data
          applyEntityData(identifier, definitions);
        }
      }
    });
  };
}
function parseDefinitions(sourcePath: string): AtomPropsDefinition {
  const parsed = tparser.parseFileSync(sourcePath, '');
  const declarations = parsed.declarations;
  const definitions: AtomPropsDefinition = {};
  declarations.forEach(declaration => {
    if (Object.hasOwn(declaration, 'properties')) {
      const d = declaration as ClassLikeDeclaration;
      definitions[declaration.name] = d.properties.map(property => {
        return {
          identifier: property.name,
          type: property.type,
          description: '',
          required: !property.isOptional ? true : undefined,
        };
      });
    }
  });
  return definitions;
}
