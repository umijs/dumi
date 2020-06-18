/**
 * Atom asset type definition
 * @note  for example, a Button component is an atom asset
 */

export default interface AtomAsset {
  /**
   * The export module identifier of atom asset
   */
  identifier: string;
  /**
   * Atom asset name
   */
  name: string;
  /**
   * Atom asset English name
   */
  'name.en-US'?: string;
  /**
   * TODO: the API spec of atom asset
   */
  props: any;
}
