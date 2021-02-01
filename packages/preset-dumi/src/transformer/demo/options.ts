import ctx from '../../context';

export interface IDemoOpts {
  isTSX: boolean;
  fileAbsPath: string;
  transformRuntime?: any;
}

export const getBabelOptions = ({ isTSX, fileAbsPath, transformRuntime }: IDemoOpts) => ({
  // rename filename.md to filename.tsx to prevent babel transform failed
  filename: fileAbsPath.replace(/\.md$/, isTSX ? '.tsx' : '.jsx'),
  presets: [
    [
      require.resolve('@umijs/babel-preset-umi/app'),
      {
        reactRequire: false,
        typescript: isTSX,
        ...(transformRuntime === undefined ? {} : { transformRuntime }),
      },
    ],
    ...(ctx.umi?.config?.extraBabelPresets || []),
  ],
  plugins: [
    [require.resolve('@babel/plugin-transform-modules-commonjs'), { strict: true }],
    ...(ctx.umi?.config?.extraBabelPlugins || []),
  ],
  ast: true,
  babelrc: false,
  configFile: false,
});
