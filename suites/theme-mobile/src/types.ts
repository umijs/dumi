export interface IThemeConfig {
  /**
   * hd solution configurations
   * @note  base on https://github.com/umijs/umi-hd
   */
  hd?: {
    rules: {
      minWidth?: number;
      maxWidth?: number;
      mode: 'vl' | 'flex' | 'vw' | 'vh';
      options?: number | [number, number];
    }[];
  };
  /**
   * set device width in desktop
   */
  deviceWidth?: number;
}
