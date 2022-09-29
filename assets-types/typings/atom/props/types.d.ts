/**
 * supported type mapping
 */
export interface TypeMap {
  string: string;
  number: number;
  boolean: boolean;
  object: object;
  array: Array<any>;
  element: EntityType<'element', ElementInstance>;
  function: EntityType<'function', FunctionInstance>;
  dom: EntityType<'dom', DomInstance>;
  any: any;
}

/**
 * entity type
 * @note  such as ReactNode or Function
 */
export type EntityType<TypeName, Shape> = {
  $$__type: TypeName;
  $$__body: Shape;
};

/**
 * ReactNode type
 */
export type ElementInstance = {
  /**
   * export name of component
   */
  componentName: string;
  /**
   * the NPM package component belongs to
   * @note  empty means current package
   */
  npmPackageName?: string;
  /**
   * props of component
   */
  props: Record<string, TypeMap[keyof TypeMap]>;
} & Record<string, any>;

/**
 * Function type
 */
export type FunctionInstance = {
  /**
   * source code of function
   */
  sourceCode: string;
};

/**
 * DOM type
 */
export type DomInstance = {
  id: string;
};
