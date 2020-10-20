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
          const fields = ['identifier', 'description', 'type', 'default', 'required'];

          fields.forEach(field => {
            switch (field) {
              case 'type':
                result.type = prop.type.raw || prop.type.name;
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
