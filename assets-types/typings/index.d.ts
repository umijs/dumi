import type ExampleAsset from './example';
import type { ExampleBlockAsset, ExamplePresetAsset } from './example';

export type { ExampleAsset, ExampleBlockAsset, ExamplePresetAsset };

export interface AssetsPackage {
  /**
   * product name of assets package
   * @example Ant Design
   */
  name: string;
  /**
   * description of assets package
   */
  description?: string;
  /**
   * npm package name of assets package
   * @example antd
   */
  npmPackageName: string;
  /**
   * current version of assets package
   */
  version: string;
  /**
   * logo url of assets package
   * @note  recommended ratio is 1:1
   */
  logo?: string;
  /**
   * preview image urls of assets package
   */
  previews?: string[];
  /**
   * homepage url of assets package
   */
  homepage?: string;
  /**
   * repository info of assets package
   */
  repository:
    | string
    | {
        type: string;
        url: string;
        directory?: string;
      };
  /**
   * ui assets of assets package
   */
  assets: {
    // FIXME: real types
    atoms: any;
    examples: ExampleAsset[];
  };
}

export default AssetsPackage;
