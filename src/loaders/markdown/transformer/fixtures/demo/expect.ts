import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  // replace to global DumiDemo component
  expect(ret.content).toEqual(
    '<><DumiDemo id="demo-0" /><DumiDemo id="demo-1" /></>;\n',
  );

  // code block demo to inline component
  expect(ret.meta.demos[0].id).toEqual('demo-0');
  expect(ret.meta.demos[0].component).toContain('Fake');

  // external demo to lazy import component
  expect(ret.meta.demos[1].id).toEqual('demo-1');
  expect(ret.meta.demos[1].component).toContain('React.lazy');
};
