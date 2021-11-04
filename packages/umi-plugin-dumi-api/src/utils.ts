import parser from './api-parser';
import { IDumiElmNode } from '@umijs/preset-dumi/lib/transformer/remark';
import { listenFileOnceChange } from '@umijs/preset-dumi/lib/utils/watcher';
import { IApi } from '@umijs/types';
import { ArgsType } from '@umijs/utils';
import deepmerge from 'deepmerge';
import path from 'path';
import { parseElmAttrToProps } from '@umijs/preset-dumi/lib/transformer/remark/utils';
import context from '@umijs/preset-dumi/lib/context';

export function applyApiData(identifier: string, definitions: ReturnType<typeof parser>) {
  if (identifier && definitions) {
    context.umi?.applyPlugins({
      key: 'dumi.detectApi',
      type: context.umi?.ApplyPluginsType.event,
      args: {
        identifier,
        data: definitions,
      },
    });
  }
}

/**
 * detect component name via file path
 */
export function guessComponentName(fileAbsPath: string) {
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

export function serializeAPINodes(
  node: IDumiElmNode,
  identifier: string,
  definitions: ReturnType<typeof parser>,
) {
  const parsedAttrs = parseElmAttrToProps(node.properties);
  const expts: string[] = parsedAttrs.exports || Object.keys(definitions);
  const showTitle = !parsedAttrs.hideTitle;

  return expts.reduce<IDumiElmNode[]>((list, expt, i) => {
    // render large API title if it is default export
    // or it is the first export and the exports attribute was not custom
    const isInsertAPITitle = expt === 'default' || (!i && !parsedAttrs.exports);
    // render sub title for non-default export
    const isInsertSubTitle = expt !== 'default';
    const apiNode = deepmerge({}, node);

    // insert API title
    if (showTitle && isInsertAPITitle) {
      list.push(
        {
          type: 'element',
          tagName: 'h2',
          properties: {},
          // @ts-ignore
          children: [{ type: 'text', value: 'API' }],
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
          properties: { id: `api-${expt.toLowerCase()}` },
          // @ts-ignore
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
 * watch component change to update api data
 * @param absPath       component absolute path
 * @param identifier    api identifier
 * @param parseOpts     extra parse options
 */
export function watchComponentUpdate(
  absPath: string,
  identifier: string,
  parseOpts: ArgsType<typeof parser>[1],
) {
  listenFileOnceChange(absPath, () => {
    let definitions: ReturnType<typeof parser>;

    try {
      definitions = parser(absPath, parseOpts);
    } catch (err) {
      /* noting */
    }

    // update api data
    // @ts-ignore
    applyApiData(identifier, definitions);

    // watch next turn
    watchComponentUpdate(absPath, identifier, parseOpts);
  });
}
