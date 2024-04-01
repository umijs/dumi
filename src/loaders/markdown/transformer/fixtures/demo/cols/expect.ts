import type { IMdTransformerResult } from '../../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toMatchInlineSnapshot(`
    "<><DumiDemoGrid items={[{
      \\"demo\\": {
        \\"id\\": \\"demo-foo\\"
      },
      \\"previewerProps\\": {
        \\"id\\": \\"foo\\",
        \\"title\\": \\"分栏 1\\",
        \\"filename\\": \\"demo.jsx\\"
      }
    }, {
      \\"demo\\": {
        \\"id\\": \\"demo-bar\\"
      },
      \\"previewerProps\\": {
        \\"id\\": \\"bar\\",
        \\"title\\": \\"分栏 2\\",
        \\"filename\\": \\"demo.jsx\\"
      }
    }, {
      \\"demo\\": {
        \\"id\\": \\"demo-baz\\"
      },
      \\"previewerProps\\": {
        \\"id\\": \\"baz\\",
        \\"title\\": \\"分栏 3\\",
        \\"filename\\": \\"demo.jsx\\"
      }
    }, {
      \\"demo\\": {
        \\"id\\": \\"demo-other\\"
      },
      \\"previewerProps\\": {
        \\"id\\": \\"other\\",
        \\"title\\": \\"分栏 4\\",
        \\"filename\\": \\"demo.jsx\\"
      }
    }]} /><DumiDemo {...{
      \\"demo\\": {
        \\"id\\": \\"demo-bad-1\\"
      },
      \\"previewerProps\\": {
        \\"id\\": \\"bad-1\\",
        \\"title\\": \\"bad 分栏 1\\",
        \\"filename\\": \\"demo.jsx\\"
      }
    }} /><DumiDemo {...{
      \\"demo\\": {
        \\"id\\": \\"demo-bad-2\\"
      },
      \\"previewerProps\\": {
        \\"id\\": \\"bad-2\\",
        \\"title\\": \\"bad 分栏 2\\",
        \\"filename\\": \\"demo.jsx\\"
      }
    }} /></>"
  `);
};
