import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toContain('<Foo');
  expect(ret.content).toContain('bar1="bar1"');
  expect(ret.content).toContain('bar2=""');
  expect(ret.content).toContain('<HelloWorld>');
  expect(ret.content).toContain('<invalid />');

  // don't transform tagName which is part of attr value
  expect(ret.content).toContain('value="Array<Function>"');
  expect(ret.content).toContain('html="<Some a></Some>"');
  expect(ret.content).toContain('value="<Some a></Some>"');
  expect(ret.content).toContain('html=&quot;<Other a></Other>&quot');
};
