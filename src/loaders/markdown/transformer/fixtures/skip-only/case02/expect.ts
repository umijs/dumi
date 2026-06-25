import type { IMdTransformerResult } from '../..';
import { omitDemoLoader } from '../../utils';

export default (ret: IMdTransformerResult) => {
  expect(omitDemoLoader(ret.content)).toEqual(`<><DumiDemoGrid items={[{
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
