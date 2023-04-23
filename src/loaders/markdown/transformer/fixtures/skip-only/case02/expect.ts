import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(`<><DumiDemoGrid items={[{
  "demo": {
    "id": "demo-foo"
  },
  "previewerProps": {
    "filename": "../demos/foo.jsx"
  }
}, {
  "demo": {
    "id": "demo-bar"
  },
  "previewerProps": {
    "filename": "../demos/bar.jsx"
  }
}]} /></>`);
};
