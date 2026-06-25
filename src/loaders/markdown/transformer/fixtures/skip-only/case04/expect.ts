import type { IMdTransformerResult } from '../..';
import { omitDemoLoader } from '../../utils';

export default (ret: IMdTransformerResult) => {
  expect(omitDemoLoader(ret.content)).toEqual(`<><DumiDemo {...{
  "demo": {
    "id": "demo-bar"
  },
  "previewerProps": {
    "only": true,
    "filename": "../demos/bar.jsx"
  }
}} /></>`);
};
