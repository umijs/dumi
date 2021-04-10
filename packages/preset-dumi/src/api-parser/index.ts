import parser from "./parser";
import type { AtomPropsDefinition } from 'dumi-assets-types';
import FileCache from '../utils/cache';

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

// first is types of components, second is types of types
export type IApiDefinition = [AtomPropsDefinition, AtomPropsDefinition];

export default (filePath: string, componentName?: string) => {
  let definitions: IApiDefinition = cacher.get(filePath);
  const isDefaultRegExp = new RegExp(`^${componentName}$`, 'i');

  if (!definitions) {
    let defaultDefinition: AtomPropsDefinition[string];
    definitions = [{}, {}];

    parser(
      filePath,
      { esModuleInterop: true, jsx: 'preserve' as any },
      {
        componentNameResolver: source => {
          // use parsed component name from remark pipeline as default export's displayName
          return DEFAULT_EXPORTS.includes(source.getName()) ? componentName : undefined;
        },
      }).forEach(item => {
        // convert result to IApiDefinition
        const exportName = isDefaultRegExp.test(item.displayName) ? 'default' : (item.displayName || item.interfaceName);
        const props = Object.entries(item.props).map(([identifier, prop]) => {
          const result = { identifier } as IApiDefinition[number][string][0];
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
          definitions[item.type === 'component' ? 0 : 1][exportName] = props;
        }
      });

    // to make sure default export always in the top
    if (defaultDefinition) {
      definitions[0] = Object.assign({ default: defaultDefinition }, definitions[0]);
    }

    cacher.add(filePath, definitions);
  }

  return definitions;
}