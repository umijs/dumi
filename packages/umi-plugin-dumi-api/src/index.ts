// ref:
// - https://umijs.org/plugins/api
import { IApi } from '@umijs/types';
// @ts-ignore
import has from 'hast-util-has-property';
import { getModuleResolvePath } from '@umijs/preset-dumi/lib/utils/moduleResolver';
import { listenFileOnceChange } from '@umijs/preset-dumi/lib/utils/watcher';
import { ArgsType } from '@umijs/utils';
import path from 'path';
import { parseElmAttrToProps } from '@umijs/preset-dumi/lib/transformer/remark/utils';
import parser, { IApiDefinition } from './api-parser';
import deepmerge from 'deepmerge';
import { IDumiElmNode } from '@umijs/preset-dumi/lib/transformer/remark';

function applyApiData(api: IApi, identifier: string, definitions: ReturnType<typeof parser>) {
  if (identifier && definitions) {
    api.applyPlugins({
      key: 'dumi.detectApi',
      type: api.ApplyPluginsType.event,
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

function serializeAPINodes(
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
function watchComponentUpdate(
  api: IApi,
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
    applyApiData(api, identifier, definitions);

    // watch next turn
    watchComponentUpdate(api, absPath, identifier, parseOpts);
  });
}

export default function (api: IApi) {
  const apis: Record<string, IApiDefinition> = {};
  const generateApisFile = () => {
    api.writeTmpFile({
      path: 'dumi/apis.json',
      content: JSON.stringify(apis, null, 2),
    });
  };

  // write all apis into .umi dir
  api.onGenerateFiles(() => {
    generateApisFile();
  });

  // register demo detections
  api.register({
    key: 'dumi.detectApi',
    fn({ identifier, data }: any) {
      const isUpdated = Boolean(apis[identifier]);

      apis[identifier] = data;

      if (isUpdated) {
        generateApisFile();
      }
    },
  });

  api.describe({
    key: 'apiParser',
    config: {
      schema(joi) {
        return joi.object();
      },
      default: {},
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    // setOptions('apiParser', memo.apiParser);

    return memo;
  });

  api.register({
    key: 'dumi.registerMdComponent',
    fn: () => ({
      // 注册组件的名称，首字母必须大写以符合 JSX 的约定
      name: 'API',
      // 运行时的组件路径，会被 dumi 注册为全局组件，可在任一 Markdown 中使用
      component: path.join(__dirname, 'API.js'),
      // 编译时的处理函数，入参是 rehype 解析之后的 HTML Abstract Syntax Tree
      // refer: https://github.com/syntax-tree/hast
      compiler(node: any, i: number, parent: any, vFile: any) {
        let identifier: string;
        let definitions: ReturnType<typeof parser>;
        const parseOpts = parseElmAttrToProps(node.properties);

        if (has(node, 'src')) {
          const src = node.properties.src || '';
          let absPath = path.join(path.dirname((this as any).data('fileAbsPath')), src);
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
          definitions = parser(absPath, parseOpts);
          identifier = componentName || src;

          // trigger listener to update previewer props after this file changed
          watchComponentUpdate(api, absPath, identifier, parseOpts);
        } else if (vFile.data.componentName) {
          try {
            const sourcePath = getModuleResolvePath({
              basePath: process.cwd(),
              sourcePath: path.dirname((this as any).data('fileAbsPath')),
              silent: true,
            });

            parseOpts.componentName = vFile.data.componentName;
            definitions = parser(sourcePath, parseOpts);
            identifier = vFile.data.componentName;

            // trigger listener to update previewer props after this file changed
            watchComponentUpdate(api, sourcePath, identifier, parseOpts);
          } catch (err) {
            /* noting */
          }
        }

        // @ts-ignore
        if (identifier && definitions) {
          // replace original node
          parent.children.splice(i, 1, ...serializeAPINodes(node, identifier, definitions));
          // apply api data
          applyApiData(api, identifier, definitions);
        }
      },
    }),
  });
}
