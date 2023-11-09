import { describe, expect, test } from 'vitest';
import iifePlugin from '..';
import { transpile } from './utils';

test('use with other plugins', async () => {
  expect(
    await transpile(
      `
    import { defineComponent } from 'vue';
    import { Button } from '@examples/vue3';
    export default defineComponent({
      setup() {
        return () => <Button>hello</Button>;
      },
    });
    `,
      {
        plugins: [require.resolve('@vue/babel-plugin-jsx'), iifePlugin],
      },
    ),
  ).toMatchSnapshot();
});

describe('options test', () => {
  test('wrappedByIIFE = false', async () => {
    expect(
      await transpile(
        `
      import a from 'a';
      export default a;
      `,
        {
          plugins: [[iifePlugin, { wrappedByIIFE: false }]],
        },
      ),
    ).toMatchSnapshot();
  });

  test('forceAsync = false', async () => {
    expect(
      await transpile(
        `
      const forceAsync = false;
      export default forceAsync;
      `,
        {
          plugins: [[iifePlugin, { forceAsync: true }]],
        },
      ),
    ).toMatchSnapshot();
  });
});
