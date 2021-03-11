import loader from './rawCode';

describe('loader: raw code', () => {
  it('should load raw code', async () => {
    const result = await loader("import './index.less';\n");

    // expect load as raw module
    expect(result).toEqual(`export default "import './index.less';"`);
  });
});
