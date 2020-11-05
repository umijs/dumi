/**
 * Atom asset type definition
 * @note  for example, a Button component is an atom asset
 */

interface TypeMap {
  string: string;
  number: number;
  boolean: boolean;
  object: object;
  array: Array<any>;
  any: any;
}

type TypeString = keyof TypeMap;

export interface BasePropertySchema<T extends TypeString = TypeString> {
  /**
   * 名称
   */
  title?: string;
  /**
   * 描述
   */
  description?: string;
  'description.zh-CN'?: string;
  'description.en-US'?: string;
  /**
   * 默认值
   */
  default?: TypeMap[T];
  /**
   * 数据类型，目前仅包含基础类型，需要扩充实体类型，比如 reactNode、moment、function
   */
  type?: T;
  /**
   * 常量类型
   */
  const?: TypeMap[T];
  /**
   * 枚举值
   */
  enum: TypeMap[T][];
  /**
   * 属性取值示例，比如 border.examples: 有无边框、无边框
   */
  examples: TypeMap[T][];
  /**
   * 属性的分支情况
   */
  oneOf?: PropertySchema[];
  /**
   * 属性的并情况
   */
  allOf?: PropertySchema[];
}

export interface StringPropertySchema extends BasePropertySchema {
  type: 'string';
}

export interface BooleanPropertySchema extends BasePropertySchema {
  type: 'boolean';
}

export interface NumberPropertySchema extends BasePropertySchema {
  type: 'number';
}

export interface ArrayPropertySchema extends BasePropertySchema {
  type: 'array';
  /**
   * 数组的子项类型定义
   */
  items?: PropertySchema;
  /**
   * 数组里每一项都是不同的
   */
  uniqueItems?: boolean;
  /**
   * 最小长度
   */
  minItems?: number;
  /**
   * 最大长度
   */
  maxItems?: number;
}

export interface ObjectPropertySchema extends BasePropertySchema {
  type: 'object';
  /**
   * 子属性类型
   */
  properties?: Record<string, PropertySchema>;
  /**
   * 字典形式的子项类型
   */
  additionalProperties?: PropertySchema;
  /**
   * 属性只有在对象里才存在 required 的概念
   */
  required?: string[];
}

export type PropertySchema =
  | BasePropertySchema
  | ObjectPropertySchema
  | ArrayPropertySchema
  | StringPropertySchema
  | NumberPropertySchema
  | BooleanPropertySchema;

export default interface AtomAsset {
  /**
   * The export module identifier of atom asset
   */
  exportName: string;
  /**
   * Atom asset name
   */
  name: string;
  /**
   * Atom asset English name
   */
  'name.en-US'?: string;
  /**
   * atom uuid
   */
  uuid?: string;
  /**
   * the API spec of atom asset
   */
  props: ObjectPropertySchema;
}
