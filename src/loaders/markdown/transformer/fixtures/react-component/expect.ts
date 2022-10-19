import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toContain('<Foo');
  expect(ret.content).toContain('bar1="bar1"');
  expect(ret.content).toContain('bar2=""');
  expect(ret.content).toContain('<HelloWorld>');
  expect(ret.content).toContain('<invalid />');
};
