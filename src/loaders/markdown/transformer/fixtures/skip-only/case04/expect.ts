import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(`<><DumiDemo {...{
  "demo": {
    "id": "demo-bar"
  },
  "previewerProps": {
    "only": true,
    "filename": "../demos/bar.jsx"
  }
}} /></>`);
};
