import * as parser from 'react-docgen-typescript';

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
  const definitions: IPropDefinitions = {};

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

      definitions[exportName] = Object.entries(item.props).map(([identifier, prop]) => {
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
    });

  return definitions;
};
