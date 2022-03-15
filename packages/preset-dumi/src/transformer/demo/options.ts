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
      require.resolve('@umijs/babel-preset-umi'),
      {
        env: {
          useBuiltIns: 'entry',
          corejs: 3,
          modules: false,
        },
        transformRuntime: {},
        lockCoreJS3: {},
        reactRequire: false,
        typescript: isTSX,
        ...(transformRuntime === undefined ? {} : { transformRuntime }),
      },
    ],
    ...(ctx.umi?.config?.extraBabelPresets || []),
  ],
  plugins: [
    ...(ctx.umi?.config?.extraBabelPlugins || []),
    [require.resolve('@babel/plugin-transform-modules-commonjs'), { strict: true }],
  ],
  ast: true,
  babelrc: false,
  configFile: false,
});
