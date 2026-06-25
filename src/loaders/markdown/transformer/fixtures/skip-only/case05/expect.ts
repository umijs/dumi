import type { IMdTransformerResult } from '../..';
import { omitDemoLoader } from '../../utils';

export default (ret: IMdTransformerResult) => {
  expect(omitDemoLoader(ret.content)).toEqual(`<><DumiDemo {...{
  "demo": {
    "id": "demo-baz"
  },
  "previewerProps": {
    "only": true,
    "filename": "../demos/baz.jsx"
  }
}} /></>`);
};
