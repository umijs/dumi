import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  // replace to global DumiDemo component
  expect(ret.content).toEqual(`<><DumiDemo {...{
  "demo": {
    "id": "demo-0"
  },
  "previewerProps": {}
}} /><DumiDemo {...{
  "demo": {
    "id": "demo-demo"
  },
  "previewerProps": {
    "filename": "demo.jsx"
  }
}} /></>`);

  // code block demo to inline component
  expect(ret.meta.demos![0].id).toEqual('demo-0');
  expect(ret.meta.demos![0].component).toContain('Fake');

  // external demo to lazy import component
  expect(ret.meta.demos![1].id).toEqual('demo-demo');
  expect(ret.meta.demos![1].component).toContain('React.lazy');
};
