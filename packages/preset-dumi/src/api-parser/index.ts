import * as parser from 'react-docgen-typescript-dumi-tmp';
import type { AtomPropsDefinition } from 'dumi-assets-types';
import FileCache from '../utils/cache';
import ctx from '../context';
import type { IDumiOpts } from '../context';

const cacher = new FileCache();
// ref: https://github.com/styleguidist/react-docgen-typescript/blob/048980a/src/parser.ts#L1110
const DEFAULT_EXPORTS = [
  'default',
  '__function',
  'Stateless',
  'StyledComponentClass',
  'StyledComponent',
  'FunctionComponent',
  'StatelessComponent',
  'ForwardRefExoticComponent',
];

export type IApiDefinition = AtomPropsDefinition;

export type IApiExtraElement = IDumiOpts['apiParser'];

export default (filePath: string, apiElements: IApiExtraElement = {}, componentName?: string) => {
  const globalConfig = ctx.opts?.apiParser;
  const {
    excludes = globalConfig?.excludes,
    ignoreNodeModules = globalConfig?.ignoreNodeModules,
    skipPropsWithoutDoc = globalConfig?.skipPropsWithoutDoc,
    propFilter = globalConfig?.propFilter,
  } = apiElements;
  let definitions: IApiDefinition = cacher.get(filePath);
  const isDefaultRegExp = new RegExp(`^${componentName}$`, 'i');

  if (!definitions) {
    let defaultDefinition: IApiDefinition[''];

    definitions = {};
    parser
      .withCompilerOptions(
        { esModuleInterop: true, jsx: 'preserve' as any },
        {
          savePropValueAsString: true,
          shouldExtractLiteralValuesFromEnum: true,
          shouldRemoveUndefinedFromOptional: true,
          componentNameResolver: source => {
            // use parsed component name from remark pipeline as default export's displayName
            return DEFAULT_EXPORTS.includes(source.getName()) ? componentName : undefined;
          },
          propFilter:
            propFilter ||
            (prop => {
              let passFlag = true;
              if (
                ignoreNodeModules &&
                prop.declarations !== undefined &&
                prop.declarations.length > 0
              ) {
                const hasPropAdditionalDescription = prop.declarations.find(declaration => {
                  return !declaration.fileName.includes('node_modules');
                });
                passFlag = Boolean(hasPropAdditionalDescription);
              }
              if (skipPropsWithoutDoc) {
                passFlag = passFlag && prop.description.length !== 0;
              }
              if (excludes?.length) {
                passFlag =
                  passFlag && !excludes?.find(patten => new RegExp(patten).test(prop.name));
              }
              return passFlag;
            }),
        },
      )
      .parse(filePath)
      .forEach(item => {
        // convert result to IApiDefinition
        const exportName = isDefaultRegExp.test(item.displayName) ? 'default' : item.displayName;
        const props = Object.entries(item.props).map(([identifier, prop]) => {
          const result = { identifier } as IApiDefinition[''][0];
          const fields = ['identifier', 'description', 'type', 'defaultValue', 'required'];
          const localeDescReg = /(?:^|\n+)@description\s+/;

          fields.forEach(field => {
            switch (field) {
              case 'type':
                result.type = prop.type.raw || prop.type.name;
                break;

              case 'description':
                // the workaround way for support locale description
                // detect locale description content, such as @description.zh-CN xxx
                if (localeDescReg.test(prop.description)) {
                  // split by @description symbol
                  const groups = prop.description.split(localeDescReg).filter(Boolean);

                  groups?.forEach(str => {
                    const [, locale, content] = str.match(/^(\.[\w-]+)?\s*([^]*)$/);

                    result[`description${locale || ''}`] = content;
                  });
                } else if (prop.description) {
                  result.description = prop.description;
                }
                break;

              case 'defaultValue':
                if (prop[field]) {
                  result.default = prop[field].value;
                }
                break;

              default:
                if (prop[field]) {
                  result[field] = prop[field];
                }
            }
          });

          return result;
        });

        if (exportName === 'default') {
          defaultDefinition = props;
        } else {
          definitions[exportName] = props;
        }
      });

    // to make sure default export always in the top
    if (defaultDefinition) {
      definitions = Object.assign({ default: defaultDefinition }, definitions);
    }
  }

  cacher.add(filePath, definitions);

  return definitions;
};
