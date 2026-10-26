import { areDumiDemoPropsEqual } from './areDumiDemoPropsEqual';

test('rerenders when an equal-length demo version changes', () => {
  const createProps = (version: string) => ({
    demo: {
      id: 'docs-demo-0',
      loader: async () => ({ demos: {} }),
      version,
    },
    previewerProps: {},
  });

  expect(
    areDumiDemoPropsEqual(createProps('f1e560f3'), createProps('853db449')),
  ).toBe(false);
});
