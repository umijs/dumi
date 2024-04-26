import type { BuiltinTags } from './jsdoc';
import type { TypeMap } from './types';

export interface PropertySourceReference {
  /**
   * fileName of the source file
   */
  fileName: string;
  /**
   * The one based number of the line that emitted the declaration
   */
  line: number;
  /**
   * The index of the character that emitted the declaration
   */
  character: number;
  /**
   * URL for displaying source file, usually the git repo file URL
   */
  url?: string;
}

/**
 * base props definition
 */
export interface BasePropertySchema<T extends keyof TypeMap = keyof TypeMap> {
  /**
   * title of prop
   */
  title?: string;
  /**
   * description of prop
   */
  description?: string;
  /**
   * category of prop
   */
  category?: string | true;
  /**
   * default value of prop
   */
  default?: TypeMap[T];
  /**
   * value type of prop
   */
  type?: T;
  /**
   * the full name of the type
   */
  className?: string;
  /**
   * const value of prop
   */
  const?: TypeMap[T];
  /**
   * enum value of prop
   */
  enum?: TypeMap[T][];
  /**
   * value examples of prop
   */
  examples?: TypeMap[T][];
  /**
   * value branch of prop
   */
  oneOf?: PropertySchema[];
  /**
   * value combine of prop
   */
  allOf?: PropertySchema[];

  /**
   * extra jsdoc tags
   */
  tags?: BuiltinTags & Record<string, any>;
  /**
   * source of prop
   */
  source?: PropertySourceReference[];
}

/**
 * string prop definition
 */
export interface StringPropertySchema extends BasePropertySchema {
  type: 'string';
}

/**
 * boolean prop definition
 */
export interface BooleanPropertySchema extends BasePropertySchema {
  type: 'boolean';
}

/**
 * number prop definition
 */
export interface NumberPropertySchema extends BasePropertySchema {
  type: 'number';
}

/**
 * array prop definition
 */
export interface ArrayPropertySchema extends BasePropertySchema {
  type: 'array';
  /**
   * definition of array items
   */
  items?: PropertySchema;
  /**
   * unique item mark
   */
  uniqueItems?: boolean;
  /**
   * minimum length of array
   */
  minItems?: number;
  /**
   * maximum length of array
   */
  maxItems?: number;
}

/**
 * object prop definition
 */
export interface ObjectPropertySchema extends BasePropertySchema {
  type: 'object';
  /**
   * children props definition
   */
  properties?: Record<string, PropertySchema>;
  /**
   * additional props definition
   */
  additionalProperties?: PropertySchema;
  /**
   * require children props
   */
  required?: string[];
}

export interface ReferencePropertySchema extends BasePropertySchema {
  type: 'reference';
  name: string;
  typeParameters?: PropertySchema[];
  externalUrl: string;
}

export interface FunctionArgSchema {
  key: string;
  schema: PropertySchema;
  hasQuestionToken?: boolean;
}

export interface FunctionPropertySchema extends BasePropertySchema {
  type: 'function';
  signature: {
    isAsync: boolean;
    returnType: PropertySchema;
    arguments: FunctionArgSchema[];
  };
}

/**
 * prop definition
 */
export type PropertySchema =
  | BasePropertySchema
  | ObjectPropertySchema
  | ArrayPropertySchema
  | FunctionPropertySchema
  | StringPropertySchema
  | NumberPropertySchema
  | BooleanPropertySchema
  | ReferencePropertySchema;
