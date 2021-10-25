export default interface IThemeMobileConfig {
  // title text at left on status bar of device
  carrier?: string;
  /**
   * hd solution configurations
   * @note  base on https://github.com/umijs/umi-hd
   */
  hd: {
    rules: {
      minWidth?: number;
      maxWidth?: number;
      mode: 'vl' | 'flex' | 'vw' | 'vh';
      options?: number | [number, number];
    }[];
  };
}
