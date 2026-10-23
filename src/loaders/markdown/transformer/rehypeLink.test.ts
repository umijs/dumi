import type { Element, Root } from 'hast';
import path from 'path';
import { visit } from 'unist-util-visit';
import { vi } from 'vitest';
import transformer, { type IMdTransformerOptions } from '.';

const fixtureFile = path.join(__dirname, 'fixtures/normal/index.md');

function route(id: string, file: string, absPath: string) {
  return { id, file, absPath, path: absPath };
}

async function transformLinks(
  content: string,
  routes: IMdTransformerOptions['routes'],
  fileAbsPath = fixtureFile,
) {
  const links: Element[] = [];
  await transformer(content, {
    cwd: __dirname,
    fileAbsPath,
    techStacks: [],
    alias: {},
    pkg: { name: 'dumi' },
    locales: [],
    resolve: {
      atomDirs: [],
      docDirs: [],
      codeBlockMode: 'active',
      forceKebabCaseRouting: true,
    },
    routes,
    extraRehypePlugins: [
      () => (tree: Root) => {
        visit(tree, 'element', (node) => {
          if (node.tagName === 'Link' || node.tagName === 'a') links.push(node);
        });
      },
    ],
  });

  return links;
}

test('Markdown links keep the last matching route and relative links keep the first host route', async () => {
  const targetFile = path.join(path.dirname(fixtureFile), 'other.md');
  const links = await transformLinks(
    '[Markdown](./other.md?view=full#section)\n\n[Relative](./neighbor)',
    {
      hostFirst: route('hostFirst', fixtureFile, '/guide/page'),
      targetFirst: route('targetFirst', targetFile, '/old-target'),
      hostLast: route('hostLast', fixtureFile, '/other/page'),
      targetLast: route('targetLast', targetFile, '/new-target'),
    },
  );

  expect(links.map((link) => link.properties?.to)).toEqual([
    '/new-target?view=full#section',
    '/guide/neighbor',
  ]);
});

test('ambiguous relative links keep their fallback, query, hash, and per-link warning for tab pages', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const tabFile = fixtureFile.replace(/\.md$/, '.$tab-api.md');

  try {
    const links = await transformLinks(
      '[One](./neighbor?view=one#first)\n\n[Two](./neighbor?view=two#second)',
      {
        host: route('host', fixtureFile, '/guide'),
        neighbor: route('neighbor', '/other.md', '/guide/neighbor'),
      },
      tabFile,
    );

    expect(links.map((link) => link.properties?.to)).toEqual([
      '/guide/neighbor?view=one#first',
      '/guide/neighbor?view=two#second',
    ]);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0].join(' ')).toContain(
      `Detected ambiguous link \`./neighbor?view=one#first\` in \`${tabFile}\``,
    );
    expect(warn.mock.calls[1].join(' ')).toContain(
      `Detected ambiguous link \`./neighbor?view=two#second\` in \`${tabFile}\``,
    );
  } finally {
    warn.mockRestore();
  }
});

test('external, target, and download anchors retain their existing attributes', async () => {
  const links = await transformLinks(
    [
      '[External](https://example.com/page?view=full#section)',
      '[Protocol relative](//example.com/page)',
      '<a href="./other.md?view=full#section" target="_blank">Target</a>',
      '<a href="./other.md?view=full#section" download="page.md">Download</a>',
      '[Absolute](/guide?view=full#section)',
    ].join('\n\n'),
    {},
  );

  expect(links.map((link) => link.tagName)).toEqual([
    'a',
    'a',
    'a',
    'a',
    'Link',
  ]);
  expect(
    links.map((link) => link.properties?.href ?? link.properties?.to),
  ).toEqual([
    'https://example.com/page?view=full#section',
    '//example.com/page',
    './other.md?view=full#section',
    './other.md?view=full#section',
    '/guide?view=full#section',
  ]);
  expect(links[2].properties?.target).toBe('_blank');
  expect(links[3].properties?.download).toBe('page.md');
});
