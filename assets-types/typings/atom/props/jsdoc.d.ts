/**
 * supported jsdoc tags
 */
export interface BuiltinTags {
  /**
   * prop category
   */
  category?: string;
  /**
   * prop title
   */
  title?: string;
  /**
   * prop description
   */
  description?: string;
  /**
   * prop default value
   */
  default?: any;
  /**
   * ignore in doc
   */
  ignore?: boolean;
  /**
   * customize prop panel renderer
   */
  renderType?: string;
  /**
   * customize options for prop panel renderer
   */
  renderOptions?: Record<string, any>;
}
