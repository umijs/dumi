import { getCodeBlockBabelPlugins } from './utils';

const EMOTION_PLUGIN = require.resolve('@emotion/babel-plugin');

describe('getCodeBlockBabelPlugins', () => {
  test('pick emotion plugin from extraBabelPlugins', () => {
    expect(getCodeBlockBabelPlugins(['@emotion'], process.cwd())).toEqual([
      EMOTION_PLUGIN,
    ]);
    expect(
      getCodeBlockBabelPlugins(['@emotion/babel-plugin'], process.cwd()),
    ).toEqual([EMOTION_PLUGIN]);
    expect(getCodeBlockBabelPlugins([EMOTION_PLUGIN], process.cwd())).toEqual([
      EMOTION_PLUGIN,
    ]);
  });

  test('keep plugin options', () => {
    expect(
      getCodeBlockBabelPlugins(
        [['@emotion', { labelFormat: '[dirname]-[local]' }]],
        process.cwd(),
      ),
    ).toEqual([[EMOTION_PLUGIN, { labelFormat: '[dirname]-[local]' }]]);
  });

  test('ignore other plugins & invalid config', () => {
    expect(
      getCodeBlockBabelPlugins(
        ['import', ['babel-plugin-import', {}], () => ({}), '@emotion'],
        process.cwd(),
      ),
    ).toEqual([EMOTION_PLUGIN]);
    expect(getCodeBlockBabelPlugins(undefined, process.cwd())).toEqual([]);
    expect(getCodeBlockBabelPlugins('@emotion', process.cwd())).toEqual([]);
  });

  test('skip plugin which cannot be resolved', () => {
    expect(
      getCodeBlockBabelPlugins(['@emotion'], '/path/to/non-existed-project'),
    ).toEqual([]);
  });
});
