import fs from 'fs';
import { Mustache } from 'umi/plugin-utils';

const template = fs.readFileSync(
  require.resolve('../templates/meta/index.ts.tpl'),
  'utf8',
);

function renderMetaIndex(enableUtoopackHMR: boolean) {
  return Mustache.render(template, {
    enableUtoopackHMR,
    metaFiles: [
      {
        file: '/docs/button.md',
        id: 'docs/button',
        index: 0,
        isMarkdown: true,
        loadDemoIndex: !enableUtoopackHMR,
      },
      {
        file: '/docs/custom.tsx',
        id: 'docs/custom',
        index: 1,
        isMarkdown: false,
        loadDemoIndex: false,
      },
    ],
    metaStructureHash: 'meta-files-hash',
    chunkName() {
      return '';
    },
  });
}

test('utoopack metadata index is a stable HMR boundary', () => {
  const output = renderMetaIndex(true);

  expect(output).toContain('routeStructureHash as rsh0');
  expect(output).toContain('const nextFilesMeta = {');
  expect(output).toContain('__DUMI_FILES_META__');
  expect(output).toContain("'meta-files-hash'");
  expect(output).toContain('rsh0,');
  expect(output).toContain('JSON.stringify([fm1, t1])');
  expect(output).toContain('__turbopack_context__.m.hot.accept();');
  expect(output).toContain('if (didMetaStructureChange)');
  expect(output).toContain('__turbopack_context__.m.hot.invalidate();');
});

test('non-utoopack metadata index keeps its existing output', () => {
  const output = renderMetaIndex(false);

  expect(output).toContain('export const filesMeta = {');
  expect(output).toContain('demoIndex as dmi0');
  expect(output).not.toContain('routeStructureHash as rsh0');
  expect(output).not.toContain('__DUMI_FILES_META__');
  expect(output).not.toContain('__turbopack_context__');
});
