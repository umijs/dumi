import type ts from 'typescript/lib/tsserverlibrary';

export interface Declaration {
  file: string;
  range: [number, number];
}

/**
 * Metadata of single component
 */
export interface ComponentMeta {
  name: string;
  type: TypeMeta;
  props: PropertyMeta[];
  events: EventMeta[];
  slots: SlotMeta[];
  exposed: ExposeMeta[];
}

export type ComponentItemMeta =
  | PropertyMeta
  | EventMeta
  | SlotMeta
  | ExposeMeta;

/**
 * Component library metadata
 */
export interface ComponentLibraryMeta {
  /**
   * Metadata of all components
   */
  components: Record<string, ComponentMeta>;
  /**
   * All exported common types will be stored here to facilitate reference by other types.
   */
  types: Record<string, PropertyMetaSchema>;
}

/**
 * Meta information transformer
 * used to transform standard component library metadata into another format of metadata
 */
export type MetaTransformer<T> = (meta: ComponentLibraryMeta) => T;

/**
 * custom schema resolver
 */
export type CustomSchemaResolver<T extends ComponentItemMeta> = (
  originMeta: Partial<T>,
  options: {
    ts: typeof import('typescript/lib/tsserverlibrary');
    typeChecker: ts.TypeChecker;
    symbolNode: ts.Expression;
    prop: ts.Symbol;
    targetNode?: ts.Declaration;
    targetType?: ts.Type;
    schemaOptions: MetaCheckerSchemaOptions;
  },
) => Partial<T>;

export enum TypeMeta {
  Unknown = 0,
  Class = 1,
  Function = 2,
}

export type JsDocTagMeta = Record<string, string[]>;

export interface PropertyMeta {
  type: string;
  name: string;
  default?: string;
  description: string;
  global: boolean;
  required: boolean;
  tags: JsDocTagMeta;
  schema: PropertyMetaSchema;
}

export interface EventMeta {
  name: string;
  type: string;
  description?: string;
  default?: string;
  tags?: JsDocTagMeta;
  schema: PropertyMetaSchema;
}

export interface SlotMeta {
  type: string;
  name: string;
  default?: string;
  description: string;
  tags: JsDocTagMeta;
  schema: PropertyMetaSchema;
}

export interface ExposeMeta {
  type: string;
  name: string;
  description: string;
  tags: JsDocTagMeta;
  schema: PropertyMetaSchema;
}

export enum PropertyMetaKind {
  LITERAL = 'literal',
  BASIC = 'basic',
  ENUM = 'enum',
  ARRAY = 'array',
  FUNC = 'function',
  OBJECT = 'object',
  UNKNOWN = 'unknown',
  REF = 'ref',
}

/**
 * Signature metadata description
 */
export interface SignatureMetaSchema {
  /**
   * Indicates that the method can be awaited
   */
  isAsync: boolean;
  /**
   * Return type meta
   */
  returnType: PropertyMetaSchema;
  /**
   * Function parameter meta
   */
  arguments: {
    key: string;
    type: string;
    required: boolean;
    schema?: PropertyMetaSchema;
  }[];
}

export type LiteralPropertyMetaSchema = {
  kind: PropertyMetaKind.LITERAL;
  type: string;
  value: string;
};
export type BasicPropertyMetaSchema = {
  kind: PropertyMetaKind.BASIC;
  type: string;
};
export type EnumPropertyMetaSchema = {
  kind: PropertyMetaKind.ENUM;
  type: string;
  schema?: PropertyMetaSchema[];
  ref?: string;
};
export type ArrayPropertyMetaSchema = {
  kind: PropertyMetaKind.ARRAY;
  type: string;
  schema?: PropertyMetaSchema[];
  ref?: string;
};
export type FuncPropertyMetaSchema = {
  kind: PropertyMetaKind.FUNC;
  type: string;
  schema?: SignatureMetaSchema;
  ref?: string;
};
export type ObjectPropertyMetaSchema = {
  kind: PropertyMetaKind.OBJECT;
  type: string;
  schema?: Record<string, PropertyMeta>;
  ref?: string;
};
/**
 * Note: The unknown type is mainly used to carry types that are not parsed themselves,
 * but whose type parameters need to be checked.
 */
export type UnknownPropertyMetaSchema = {
  kind: PropertyMetaKind.UNKNOWN;
  type: string;
  schema?: PropertyMetaSchema[];
  ref?: string;
};
/**
 * This type is just a placeholder, it points to other types
 */
export type RefPropertyMetaSchema = { kind: PropertyMetaKind.REF; ref: string };

/**
 * Note: The `ref` prop is designed for schema flattening.
 * Type declarations in the project will be uniformly placed in a Map,
 * and its key is the hash value calculated from the file where the declaration is located and the declaration name.
 * So you can use `ref` to find the corresponding schema in the Map
 */
export type PropertyMetaSchema =
  | LiteralPropertyMetaSchema
  | BasicPropertyMetaSchema
  | EnumPropertyMetaSchema
  | ArrayPropertyMetaSchema
  | FuncPropertyMetaSchema
  | ObjectPropertyMetaSchema
  | UnknownPropertyMetaSchema
  | RefPropertyMetaSchema;

/**
 * Schema resolver options
 */
export type MetaCheckerSchemaOptions = {
  /**
   * By default, type resolution in node_module will be abandoned.
   */
  exclude?: string | RegExp | (string | RegExp)[] | ((name: string) => boolean);
  /**
   * A list of type names to be ignored in expending in schema.
   * Can be functions to ignore types dynamically.
   */
  ignore?: (
    | string
    | ((
        name: string,
        type: ts.Type,
        typeChecker: ts.TypeChecker,
      ) => boolean | void | undefined | null)
  )[];
  /**
   * In addition to ignoring the type itself, whether to ignore the type parameters it carries.
   * By default, the type parameters it carries will be parsed.
   * For example, `Promise<{ a: string }>`, if you use option`exclude` or `ignore` to ignore `Promise`,
   * `{ a: string }` will still be parsed by default.
   */
  ignoreTypeArgs?: boolean;

  /**
   * Customized schema resolvers for some special props definition methods, such as `vue-types`
   */
  customResovlers?: CustomSchemaResolver<PropertyMeta>[];
};

/**
 * Checker Options
 */
export interface MetaCheckerOptions {
  schema?: MetaCheckerSchemaOptions;
  forceUseTs?: boolean;
  printer?: ts.PrinterOptions;
  /**
   * Whether to filter global props, the default is true
   * If it is true, global props in vue, such as key and ref, will be filtered out
   */
  filterGlobalProps?: boolean;
  /**
   * Whether to enable filtering for exposed attributes, the default is true
   * If true, only methods or properties identified by `@exposed/@expose` will be exposed in jsx
   */
  filterExposed?: boolean;
}
