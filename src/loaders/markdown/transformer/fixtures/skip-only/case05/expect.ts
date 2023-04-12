import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(`<><DumiDemo {...{
  "demo": {
    "id": "demo-baz"
  },
  "previewerProps": {
    "only": true,
    "filename": "../demos/baz.jsx"
  }
}} /></>`);
};
