import * as parser from 'react-docgen-typescript';
import FileCache from '../utils/cache';

const cacher = new FileCache();

export interface IPropDefinitions {
  /**
   * export name
   */
  [key: string]: {
    /**
     * component property name
     */
    identifier: string;
    /**
     * component property label
     */
    name?: string;
    /**
     * component property description
     */
    description?: string;
    'description.zh-CN'?: string;
    'description.en-US'?: string;
    /**
     * component property type
     */
    type: string;
    /**
     * component property default value
     */
    default?: string;
    /**
     * property whether required
     */
    required?: true;
  }[];
}

export default (filePath: string, componentName?: string) => {
  let definitions: IPropDefinitions = cacher.get(filePath);

  if (!definitions) {
    let defaultDefinition: IPropDefinitions[''];

    definitions = {};
    parser
      .withCompilerOptions(
        { esModuleInterop: true, jsx: 'preserve' as any },
        {
          savePropValueAsString: true,
          shouldExtractLiteralValuesFromEnum: true,
          shouldRemoveUndefinedFromOptional: true,
        },
      )
      .parse(filePath)
      .forEach(item => {
        // convert result to IPropDefinitions
        const exportName = item.displayName === componentName ? 'default' : item.displayName;
        const props = Object.entries(item.props).map(([identifier, prop]) => {
          const result = { identifier } as IPropDefinitions[''][0];
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
