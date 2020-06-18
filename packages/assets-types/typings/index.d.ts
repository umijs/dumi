import AtomAsset from './atom';
import ExampleAsset from './example';

export default interface AssetsPackage {
  /**
   * Assets package name
   */
  name: string;
  'name.en-US'?: string;
  /**
   * Assets package description
   */
  description?: string;
  'description.en-US'?: string;
  /**
   * NPM package name of assets package
   */
  package: string;
  /**
   * The documentation URL of assets package
   */
  homepage?: string;
  /**
   * The repository URL of assets package
   */
  repoUrl?: string;
  /**
   * All assets of assets package
   */
  assets: {
    atoms: AtomAsset[];
    examples: ExampleAsset[];
  };
}
