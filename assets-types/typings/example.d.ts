import type { TypeMap } from '../atom/props/types';

/**
 * base example asset
 */
export interface ExampleBaseAsset {
  /**
   * referenced atom ids of example
   * @example ['Button'] means this example is belong to Button component
   */
  refAtomIds: string[];
  /**
   * identifier of example
   * @note    it's unique in the same assets package
   */
  id: string;
  /**
   * title of example
   */
  title?: string;
  /**
   * description of example
   */
  description?: string;
  /**
   * snapshot image url of example
   */
  snapshot?: string;
  /**
   * keywords of example
   */
  keywords?: string[];
}

/**
 * block example asset
 * @description block example is a code snippet, it can be reused in different projects
 * @example
 * {
 *   // entry file
 *   'index.tsx': { type: 'FILE', value: 'import React from \'react\';\nimport from \'index.less\';' },
 *   // 3rd-party dependency
 *   'react': { type: 'NPM', value: '^17.0.0' },
 *   // local dependency
 *   'index.less': { type: 'FILE', value: 'balabala...' }
 * }
 */
export interface ExampleBlockAsset extends ExampleBaseAsset {
  type: 'BLOCK';
  dependencies: Record<
    string,
    {
      /**
       * dependency type
       * @note   NPM: 3rd-party dependency, such as antd
       *        FILE: local local dependency, such as index.tsx, index.less
       */
      type: 'NPM' | 'FILE';
      /**
       * dependency value
       * @note   NPM: version or git url of npm package
       *        FILE: content of file
       */
      value: string;
    }
  >;
  /**
   * Entry file name, you can find the relevant entry file content from `dependencies`
   */
  entry?: string;
}

/**
 * preset example asset
 * @description preset example is props set of component, it can be reused in different projects
 * @example     a simple preset example of Button component:
 * {
 *   type: 'primary'
 * }
 */
export interface ExamplePresetAsset extends ExampleBaseAsset {
  type: 'PRESET';
  title: string;
  value: TypeMap['element']['$$__body'];
}

type ExampleAsset = ExampleBlockAsset | ExamplePresetAsset;

export default ExampleAsset;
