import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(`<><DumiDemo {...{
  "demo": {
    "id": "demo-foo"
  },
  "previewerProps": {
    "only": true,
    "filename": "../demos/foo.jsx"
  }
}} /></>`);
};
