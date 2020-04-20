import ctx from '../../context';

export const getBabelOptions = (isTSX: boolean) => ({
  presets: [
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-env'),
    ...(ctx.umi?.config?.extraBabelPresets || []),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-class-properties'),
    [require.resolve('@babel/plugin-transform-modules-commonjs'), { strict: true }],
    ...(isTSX ? [[require.resolve('@babel/plugin-transform-typescript'), { isTSX: true }]] : []),
    ...(ctx.umi?.config?.extraBabelPlugins || []),
  ],
  ast: true,
  babelrc: false,
  configFile: false,
});
