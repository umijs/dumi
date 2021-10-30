// ref:
// - https://umijs.org/plugins/api
import { IApi } from '@umijs/types';
// @ts-ignore
import has from 'hast-util-has-property';
import { getModuleResolvePath } from '@umijs/preset-dumi/lib/utils/moduleResolver';
import path from 'path';
import { parseElmAttrToProps } from '@umijs/preset-dumi/lib/transformer/remark/utils';
import parser, { IApiDefinition } from './api-parser';
import { guessComponentName, watchComponentUpdate, serializeAPINodes, applyApiData } from './utils';
import type { IMarkdwonComponent } from '@umijs/preset-dumi/lib/transformer/remark/component';
import { setOptions } from '@umijs/preset-dumi/lib/context';

/**
 * To generate apis.json and support to config api parser
 * @param api
 */
function generateTmpFile(api: IApi) {
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

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('apiParser', memo.apiParser);

    return memo;
  });
}

export default function (api: IApi) {
  // support to generate temporary api.json
  generateTmpFile(api);

  // register config apiParser
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

  api.register({
    key: 'dumi.registerMdComponent',
    fn: (): IMarkdwonComponent => ({
      name: 'API',
      component: path.join(__dirname, 'API.js'),
      compiler(node, i, parent, vFile) {
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
          parent!.children.splice(i, 1, ...serializeAPINodes(node, identifier, definitions));
          // apply api data
          applyApiData(api, identifier, definitions);
        }
      },
    }),
  });
}
