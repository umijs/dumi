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
  typeParams?: PropertyMetaSchema[];
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

export interface SingleComponentMeta {
  component: ComponentMeta;
  types: Record<string, PropertyMetaSchema>;
}

export interface ComponentLibraryMeta {
  /**
   * Metadata of all components
   */
  components: Record<string, ComponentMeta>;
  /**
   * Metadata of functions
   */
  functions: Record<string, FuncPropertyMetaSchema>;
  /**
   * All exported common types will be stored here to facilitate reference by other types.
   */
  types: Record<string, PropertyMetaSchema>;
}

/**
 * Meta information transformer
 * @remarks
 * used to transform standard component library metadata into another format of metadata
 */
export type MetaTransformer<T> = (meta: ComponentLibraryMeta) => T;

/**
 * property schema resolver
 * @group options
 */
export type PropertySchemaResolver<T extends ComponentItemMeta> = (
  originMeta: Partial<T>,
  options: {
    ts: typeof import('typescript/lib/tsserverlibrary');
    typeChecker: ts.TypeChecker;
    schemaOptions: MetaCheckerSchemaOptions;
    symbolNode: ts.Expression;
    prop: ts.Symbol;
    targetNode?: ts.Declaration;
    targetType?: ts.Type;
  },
) => Partial<T>;

/**
 * @group options
 */
export type UnknownSymbolResolver<
  T extends PropertyMetaSchema = PropertyMetaSchema,
> = (options: {
  ts: typeof import('typescript/lib/tsserverlibrary');
  typeChecker: ts.TypeChecker;
  targetSymbol: ts.Symbol;
  schemaOptions: MetaCheckerSchemaOptions;
  targetNode: ts.Declaration;
}) => Partial<T>;

export enum TypeMeta {
  Unknown = 0,
  Class = 1,
  Function = 2,
}

export interface BlockTagContentTextMeta {
  kind: string;
  text: string;
}

export interface BlockTagMeta {
  tag: string;
  content: BlockTagContentTextMeta[];
}

export interface CommentMeta {
  /**
   * @example
   * [{ tag: 'version', content: [{ kind: 'text', text: '0.0.1' }] }]
   */
  blockTags?: BlockTagMeta[];
  /**
   * @example
   * ['alpha', 'deprecated']
   */
  modifierTags?: string[];
}

export interface PropertyMeta {
  type: string;
  name: string;
  default?: string;
  description: string;
  global: boolean;
  required: boolean;
  comment: CommentMeta;
  schema: PropertyMetaSchema;
}

export interface EventMeta {
  name: string;
  type: string;
  description?: string;
  default?: string;
  comment: CommentMeta;
  schema: PropertyMetaSchema;
}

export interface SlotMeta {
  type: string;
  name: string;
  default?: string;
  description: string;
  comment: CommentMeta;
  schema: PropertyMetaSchema;
}

export interface ExposeMeta {
  type: string;
  name: string;
  description: string;
  comment: CommentMeta;
  schema: PropertyMetaSchema;
}

export enum PropertyMetaKind {
  LITERAL = 'literal',
  BASIC = 'basic',
  ENUM = 'enum',
  ARRAY = 'array',
  FUNC = 'function',
  OBJECT = 'object',
  TYPE_PARAM = 'type_param',
  UNKNOWN = 'unknown',
  REF = 'ref',
}
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

export interface TypeParamMetaSchema {
  // extend Type
  type?: PropertyMetaSchema;
  // = Type
  default?: PropertyMetaSchema;
}

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
   * type parameters
   */
  typeParams?: PropertyMetaSchema[];
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

export interface BasePropertyMetaSchema {
  kind: PropertyMetaKind;
  /**
   * interface, type alias, type parameter
   */
  source?: PropertySourceReference[];
}

export interface LiteralPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.LITERAL;
  type: string;
  value: string;
}

export interface BasicPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.BASIC;
  type: string;
}

export interface EnumPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.ENUM;
  type: string;
  schema?: PropertyMetaSchema[];
  ref?: string;
}

export interface ArrayPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.ARRAY;
  type: string;
  schema?: PropertyMetaSchema[];
  ref?: string;
}

export interface FuncPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.FUNC;
  type: string;
  schema?: SignatureMetaSchema;
  ref?: string;
}

export interface ObjectPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.OBJECT;
  type: string;
  schema?: Record<string, PropertyMeta>;
  ref?: string;
}

export interface TypeParamPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.TYPE_PARAM;
  type: string;
  name: string;
  schema?: TypeParamMetaSchema;
  ref?: string;
}
/**
 * Note: The unknown type is mainly used to carry types that are not parsed themselves,
 * but whose type parameters need to be checked.
 */
export interface UnknownPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.UNKNOWN;
  type: string;
  typeParams?: PropertyMetaSchema[];
  ref?: string;
}

export interface ExternalRefPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.REF;
  typeParams?: PropertyMetaSchema[];
  name: string;
  /**
   * If it is not a local type, you can use this external url
   */
  externalUrl: string;
}

export interface LocalRefPropertyMetaSchema extends BasePropertyMetaSchema {
  kind: PropertyMetaKind.REF;
  ref: string;
}
/**
 * This type is just a placeholder, it points to other types
 */
export type RefPropertyMetaSchema =
  | ExternalRefPropertyMetaSchema
  | LocalRefPropertyMetaSchema;

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
  | TypeParamPropertyMetaSchema
  | UnknownPropertyMetaSchema
  | RefPropertyMetaSchema;

/**
 * Schema resolver options
 * @group options
 */
export interface MetaCheckerSchemaOptions {
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
   * Property schema resolvers for some special props definition methods, such as `vue-types`
   */
  propertyResovlers?: PropertySchemaResolver<PropertyMeta>[];

  /**
   * unknownSymbol resolver
   */
  unknownSymbolResolvers?: UnknownSymbolResolver[];

  /**
   * By default, this option is false,
   * the resolver will automatically capture the MDN links
   * contained in the comments of all declaration files under node_modules/typescript/lib.
   * Users do not need to configure externalSymbolLinkMappings themselves.
   *
   * Of course, you can also overwrite the captured links through externalSymbolLinkMappings
   */
  disableExternalLinkAutoDectect?: boolean;
  /**
   * The types/interfaces mapping method is provided as follows:
   * ```js
   * {
   *   typescript: {
   *     Promise:
   *       'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
   *   },
   * },
   * ```
   * For more complex mapping methods, please use `unknownSymbolResolvers`
   */
  externalSymbolLinkMappings?: Record<string, Record<string, string>>;
}

/**
 * Checker Options
 * @group options
 */
export interface MetaCheckerOptions extends MetaCheckerSchemaOptions {
  forceUseTs?: boolean;
  printer?: ts.PrinterOptions;
  /**
   * Disable production of source links, the default is false
   */
  disableSources?: boolean;
  /**
   * Prohibit obtaining git repo URL, git revision, and other information through git commands,
   * the default is false
   */
  disableGit?: boolean;
  /**
   * source link template, must be set when you set `disableGit`.
   *
   * A typical template looks like this: `https://github.com/umijs/dumi/{gitRevision}/{path}#L{line}`.
   *
   * The parser will replace the parts `{gitRevision|path|line}`
   */
  sourceLinkTemplate?: string;
  /**
   * https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection
   */
  gitRevision?: string;
  /**
   * Default is "origin"
   */
  gitRemote?: string;
  /**
   * Whether to filter global props, the default is true
   *
   * If it is true, global props in vue, such as key and ref, will be filtered out
   */
  filterGlobalProps?: boolean;
  /**
   * Whether to enable filtering for exposed attributes, the default is true.
   *
   * If true, only methods or properties identified by release tags like `@public` will be exposed in jsx
   */
  filterExposed?: boolean;
}
