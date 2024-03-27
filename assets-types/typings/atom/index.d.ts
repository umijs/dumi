import type {
  FunctionArgSchema,
  ObjectPropertySchema,
  PropertySchema,
} from './props';

/**
 * base atom asset
 */
export interface AtomBaseAsset {
  /**
   * identifier of atom
   * @note  the component name or function name, such as Button, Table, Checkbox
   */
  id: string;

  /**
   * title of atom
   */
  title: string;

  /**
   * keywords of atom
   */
  keywords?: string[];

  /**
   * deprecated mark of atom
   */
  deprecated?: true;

  /**
   * custom config for specific platform
   */
  platforms?: Record<string, Record<string, any>>;
}

/**
 * component atom asset
 */
export interface AtomComponentAsset extends AtomBaseAsset {
  type: 'COMPONENT';

  /**
   * props definition of component
   */
  propsConfig: ObjectPropertySchema;
  /**
   * slots definition of component
   */
  slotsConfig?: ObjectPropertySchema;
  /**
   * events definition of component
   */
  eventsConfig?: ObjectPropertySchema;
  /**
   * Whether it is methods and properties exposed by component instances,
   * or common functional calls, such as Popup.open().
   * Such imperative methods and properties should be classified under this configuration
   */
  imperativeConfig?: ObjectPropertySchema;

  /**
   * available parent components of component
   * @note  For example ['SubMenu', 'Menu'] is available parent component of `MenuItem` component
   */
  parentConfig?: {
    container: string[];
  };

  /**
   * props category config, use for ui panel
   */
  propsCategoryConfig?: Record<
    string,
    { title?: string; description?: string; defaultActive?: boolean }
  >;
}

/**
 * function atom asset
 */
export interface AtomFunctionAsset extends AtomBaseAsset {
  type: 'FUNCTION';

  /**
   * signature of function atom
   */
  signature: {
    /**
     * async mark
     */
    isAsync: boolean;

    /**
     * arguments of function
     */
    arguments: FunctionArgSchema[];

    /**
     * return value of function
     */
    returnType: PropertySchema;
  };
}

/**
 * atom asset type
 * @note  atom asset is the minimal concept of assets, it can be a component or a function
 */
type AtomAsset = AtomComponentAsset | AtomFunctionAsset;

export default AtomAsset;
