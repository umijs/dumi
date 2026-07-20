import ReactTechStack from '@/techStacks/react';
import type { IDumiTechStack } from '@/types';
import glob from 'fast-glob';
import fs from 'fs';
import os from 'os';
import path from 'path';
import transformer from '.';

const CASES_DIR = path.join(__dirname, 'fixtures');
const cases = glob
  .sync('**/index.md', { cwd: CASES_DIR, deep: 3 })
  .map((file) => path.dirname(file));

class FakeTechStack implements IDumiTechStack {
  name = 'fake';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return lang === 'jsx';
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    return opts.type === 'code-block' ? "() => 'Fake'" : raw;
  }
}

class DeferredPreviewerPropsTechStack extends FakeTechStack {
  runtimeOpts = { deferPreviewerProps: ['jsx'] } as any;

  generatePreviewerProps(
    props: Record<string, any>,
    opts: { fileAbsPath?: string },
  ) {
    return {
      ...props,
      jsx: fs.readFileSync(opts.fileAbsPath!, 'utf8'),
    };
  }
}

class TrackingPreviewerPropsTechStack extends DeferredPreviewerPropsTechStack {
  generatedFor: string[] = [];

  generatePreviewerProps(
    props: Record<string, any>,
    opts: { fileAbsPath?: string },
  ) {
    this.generatedFor.push(path.basename(opts.fileAbsPath!));
    return super.generatePreviewerProps(props, opts);
  }
}

class FullGraphFailingTechStack extends DeferredPreviewerPropsTechStack {
  onBlockLoad(): never {
    throw new Error('scoped overlay entered the full dependency graph');
  }
}

class SourceMetadataTechStack extends DeferredPreviewerPropsTechStack {
  generateMetadata(asset: any, opts: { fileAbsPath?: string }) {
    return {
      ...asset,
      title: fs.readFileSync(opts.fileAbsPath!, 'utf8').includes('B')
        ? 'B'
        : 'A',
    };
  }
}

class RendererTechStack extends DeferredPreviewerPropsTechStack {
  runtimeOpts = {
    ...this.runtimeOpts,
    rendererPath: '/custom-renderer',
  } as any;
}

class ReorderedMetadataTechStack extends DeferredPreviewerPropsTechStack {
  constructor(private reverseMetadata: boolean) {
    super();
  }

  generateMetadata(asset: any) {
    const dependencies = Object.entries(asset.dependencies);

    if (this.reverseMetadata) {
      dependencies.reverse();
    }

    return {
      ...asset,
      dependencies: Object.fromEntries(dependencies),
    };
  }

  generateSources(resolveMap: Record<string, any>) {
    const entries = Object.entries(resolveMap);

    if (this.reverseMetadata) entries.reverse();

    return Object.fromEntries(entries);
  }
}

class SidecarPreviewerPropsTechStack extends DeferredPreviewerPropsTechStack {
  generatePreviewerProps(
    props: Record<string, any>,
    opts: { fileAbsPath?: string },
  ) {
    const previewerProps = super.generatePreviewerProps(props, opts);
    const sidecar = opts.fileAbsPath!.replace(/\.\w+$/, '.md');

    return {
      ...previewerProps,
      description: fs.readFileSync(sidecar, 'utf8'),
    };
  }
}

class ReactSidecarPreviewerPropsTechStack extends ReactTechStack {
  constructor() {
    super();
    this.runtimeOpts = {
      ...this.runtimeOpts,
      deferDemoSidecar: true,
    };
  }

  generatePreviewerProps(
    props: Record<string, any>,
    opts: { fileAbsPath?: string },
  ) {
    const sidecar = opts.fileAbsPath!.replace(/\.\w+$/, '.md');

    return {
      ...props,
      description: fs.readFileSync(sidecar, 'utf8'),
      jsx: fs.readFileSync(opts.fileAbsPath!, 'utf8'),
      style: fs.readFileSync(sidecar, 'utf8'),
    };
  }
}

function getTransformerOptions(
  fileAbsPath: string,
  useUtoopackDemoHMR?: boolean,
) {
  return {
    techStacks: [new FakeTechStack()],
    cwd: path.dirname(fileAbsPath),
    fileAbsPath,
    ...(useUtoopackDemoHMR === undefined ? {} : { useUtoopackDemoHMR }),
    resolve: {
      codeBlockMode: 'active' as const,
      atomDirs: [],
      docDirs: [],
      forceKebabCaseRouting: true,
    },
    locales: [],
    routes: {},
    pkg: {},
    alias: {
      '@': __dirname,
    },
  };
}

function createReactTechStack<T extends ReactTechStack = ReactTechStack>(
  TechStack: new () => T = ReactTechStack as new () => T,
) {
  const tsExtension = require.extensions['.ts'];
  require.extensions['.ts'] = () => {};

  try {
    return new TechStack();
  } finally {
    if (tsExtension) {
      require.extensions['.ts'] = tsExtension;
    } else {
      delete require.extensions['.ts'];
    }
  }
}

for (let casePath of cases) {
  test(`markdown transformer: ${casePath}`, async () => {
    const fileAbsPath = path.join(CASES_DIR, casePath, 'index.md');
    const content = fs.readFileSync(fileAbsPath, 'utf8');
    const ret = await transformer(
      content,
      getTransformerOptions(fileAbsPath, true),
    );

    (await import(`${CASES_DIR}/${casePath}/expect.ts`)).default(ret);
  });
}

test('markdown transformer: skips local demo loader by default', async () => {
  const fileAbsPath = path.join(CASES_DIR, 'demo', 'index.md');
  const content = fs.readFileSync(fileAbsPath, 'utf8');
  const ret = await transformer(content, getTransformerOptions(fileAbsPath));

  expect(ret.content).not.toContain('"loader": () => import');
  expect(ret.content).not.toContain('"version":');
});

test('built-in React stack requires explicit sidecar ownership opt-in', () => {
  const techStack = createReactTechStack();

  expect(techStack.runtimeOpts?.deferDemoSidecar).not.toBe(true);
});

test('utoopack keeps the markdown page stable for deferred demo props', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-deferred-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>A</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new DeferredPreviewerPropsTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(demoFile, 'export default () => <div>B</div>;');

    const after = await transformer(content, options);

    expect(after.content).toBe(before.content);
    expect(before.meta.demos[0]).toMatchObject({
      previewerProps: { jsx: 'export default () => <div>A</div>;' },
    });
    expect(after.meta.demos[0]).toMatchObject({
      previewerProps: { jsx: 'export default () => <div>B</div>;' },
    });
    expect((after.meta.demos[0] as any).__dumiUtoopackHMRVersion).not.toBe(
      (before.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    );
    expect(after.content).toContain('?type=demo&overlay=1');
    expect(after.content).toContain('?type=demo")');
    expect(after.content).toContain('mergeDemoModules');
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack page demo loaders share the canonical document overlay', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-query-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = `<code src="./demo.jsx" id="quote' slash/ amp& 中文"></code>`;

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>Demo</div>;');

  try {
    const ret = await transformer(content, {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new DeferredPreviewerPropsTechStack()],
    });
    const loaderMatch = ret.content.match(/"loader": ([^\n]+),/);
    const importSpecifiers = Array.from(
      loaderMatch?.[1].matchAll(/import\(("(?:\\.|[^"\\])*")\)/g) ?? [],
      (match) => JSON.parse(match[1]) as string,
    );
    const importSpecifier = importSpecifiers.find((specifier) =>
      specifier.includes('&overlay=1'),
    );

    expect(importSpecifier).toBeDefined();
    const query = new URL(importSpecifier!, 'https://dumi.local').searchParams;
    expect(query.get('type')).toBe('demo');
    expect(query.get('overlay')).toBe('1');
    expect(query.get('demo')).toBeNull();
    expect(ret.content.match(/__dumiUtoopackHMR/g) ?? []).toHaveLength(1);
    expect(ret.content).toContain(
      `"__dumiUtoopackHMR": ${JSON.stringify(importSpecifier)}`,
    );
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack document overlays transform every demo with the lightweight path', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-scoped-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const basicFile = path.join(dir, 'basic.jsx');
  const iconFile = path.join(dir, 'icon.jsx');
  const content = [
    '<code src="./basic.jsx"></code>',
    '<code src="./icon.jsx"></code>',
  ].join('\n');
  const techStack = new TrackingPreviewerPropsTechStack();

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(basicFile, 'export default () => <div>Basic</div>;');
  fs.writeFileSync(iconFile, 'export default () => <div>Icon</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [techStack],
    };
    const overlay = await transformer(content, {
      ...options,
      demoOverlay: true,
    });

    expect(overlay.meta.demos.map((demo) => demo.id)).toEqual([
      'demo-basic',
      'demo-icon',
    ]);
    expect(techStack.generatedFor).toEqual(['basic.jsx', 'icon.jsx']);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack document overlays skip the full demo dependency graph', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-overlay-fast-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'basic.jsx');
  const content = '<code src="./basic.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(
    demoFile,
    "import './missing-dependency';\nexport default () => <div>Basic</div>;",
  );

  try {
    const overlay = await transformer(content, {
      ...getTransformerOptions(fileAbsPath, true),
      demoOverlay: true,
      techStacks: [new FullGraphFailingTechStack()],
    });

    expect(overlay.meta.demos).toHaveLength(1);
    expect(overlay.meta.demos[0]).toMatchObject({
      id: 'demo-basic',
      previewerProps: {
        jsx: expect.stringContaining("import './missing-dependency'"),
      },
      resolveMap: expect.objectContaining({
        'index.jsx': expect.stringMatching(/basic\.jsx$/),
      }),
    });
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack keeps the markdown page stable with the built-in React stack', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-react-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>A</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [createReactTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(demoFile, 'export default () => <div>B</div>;');

    const after = await transformer(content, options);

    expect(after.content).toBe(before.content);
    expect((after.meta.demos[0] as any).__dumiUtoopackHMRVersion).not.toBe(
      (before.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    );
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack defers React stack sidecar descriptions to demo HMR', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-react-sidecar-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const sidecarFile = path.join(dir, 'demo.md');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>Demo</div>;');
  fs.writeFileSync(sidecarFile, 'Description A');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [createReactTechStack(ReactSidecarPreviewerPropsTechStack)],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(sidecarFile, 'Description B');

    const after = await transformer(content, options);

    expect(after.content).toBe(before.content);
    expect((after.meta.demos[0] as any).previewerProps).toMatchObject({
      description: '<p>Description B</p>',
      style: 'Description B',
    });
    expect((after.meta.demos[0] as any).__dumiUtoopackDeferredSidecar).toBe(
      true,
    );
    expect(
      (after.meta.demos[0] as any).__dumiUtoopackDeferredPreviewerProps,
    ).toEqual(['jsx', 'description', 'style']);
    expect((after.meta.demos[0] as any).__dumiUtoopackHMRVersion).not.toBe(
      (before.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    );
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack scopes demo runtime metadata changes to demo HMR', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-metadata-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>A</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new SourceMetadataTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(demoFile, 'export default () => <div>B</div>;');

    const after = await transformer(content, options);
    const overlay = await transformer(content, {
      ...options,
      demoOverlay: true,
    });

    expect(after.content).toBe(before.content);
    expect((overlay.meta.demos[0] as any).asset.title).toBe('B');
    expect((after.meta.demos[0] as any).__dumiUtoopackHMRVersion).not.toBe(
      (before.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    );
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack keeps the legacy version behavior for inline external demos', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-inline-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx" inline></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>A</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new DeferredPreviewerPropsTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(demoFile, 'export default () => <div>B</div>;');

    const after = await transformer(content, options);

    expect(after.content).not.toBe(before.content);
    expect(after.content).not.toContain('"__dumiUtoopackHMR":');
    expect(
      (after.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    ).toBeUndefined();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack keeps the legacy path for custom renderer tech stacks', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-renderer-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>A</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new RendererTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(demoFile, 'export default () => <div>B</div>;');

    const after = await transformer(content, options);

    expect(after.content).not.toBe(before.content);
    expect(after.content).not.toContain('__dumiUtoopackHMR');
    expect(
      (after.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    ).toBeUndefined();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack keeps the markdown page stable for nested source edits', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-nested-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const helperFile = path.join(dir, 'helper.js');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(
    demoFile,
    "import label from './helper'; export default () => <div>{label}</div>;",
  );
  fs.writeFileSync(helperFile, "export default 'A';");

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new DeferredPreviewerPropsTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(helperFile, "export default 'B';");

    const after = await transformer(content, options);

    expect(after.content).toBe(before.content);
    expect((after.meta.demos[0] as any).__dumiUtoopackHMRVersion).not.toBe(
      (before.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    );
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack demo hashes ignore metadata object insertion order', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-order-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(
    demoFile,
    "import alpha from './alpha'; import beta from './beta'; export default () => <div>{alpha}{beta}</div>;",
  );
  fs.writeFileSync(path.join(dir, 'alpha.js'), "export default 'A';");
  fs.writeFileSync(path.join(dir, 'beta.js'), "export default 'B';");

  try {
    const getOptions = (reverseMetadata: boolean) => ({
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new ReorderedMetadataTechStack(reverseMetadata)],
    });
    const forward = await transformer(content, getOptions(false));
    const reverse = await transformer(content, getOptions(true));

    expect(reverse.content).toBe(forward.content);
    expect((reverse.meta.demos[0] as any).__dumiUtoopackHMRVersion).toBe(
      (forward.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    );
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack scopes demo import graph changes to demo HMR', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-imports-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(path.join(dir, 'alpha.js'), "export default 'same';");
  fs.writeFileSync(path.join(dir, 'bravo.js'), "export default 'same';");
  fs.writeFileSync(
    demoFile,
    "import label from './alpha'; export default () => <div>{label}</div>;",
  );

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new DeferredPreviewerPropsTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(
      demoFile,
      "import label from './bravo'; export default () => <div>{label}</div>;",
    );

    const after = await transformer(content, options);

    expect(after.content).toBe(before.content);
    expect((after.meta.demos[0] as any).__dumiUtoopackHMRVersion).not.toBe(
      (before.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    );
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack keeps non-deferred sidecar previewer props on the page', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-sidecar-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const sidecarFile = path.join(dir, 'demo.md');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>Demo</div>;');
  fs.writeFileSync(sidecarFile, 'Description A');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new SidecarPreviewerPropsTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(sidecarFile, 'Description B');

    const after = await transformer(content, options);

    expect(after.content).not.toBe(before.content);
    expect(after.content).toContain('Description B');
    expect((after.meta.demos[0] as any).previewerProps).toEqual({
      jsx: 'export default () => <div>Demo</div>;',
    });
    expect(
      (after.meta.demos[0] as any).__dumiUtoopackDeferredSidecar,
    ).toBeUndefined();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack refreshes the markdown page when demo frontmatter changes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-frontmatter-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(
    demoFile,
    '/**\n * title: Title A\n */\nexport default () => <div>Demo</div>;',
  );

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new DeferredPreviewerPropsTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(
      demoFile,
      '/**\n * title: Title B\n */\nexport default () => <div>Demo</div>;',
    );

    const after = await transformer(content, options);

    expect(after.content).not.toBe(before.content);
    expect(after.content).toContain('Title B');
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('deferred tech stacks keep the production transformer behavior', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-prod-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>A</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, false),
      techStacks: [new DeferredPreviewerPropsTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(demoFile, 'export default () => <div>B</div>;');

    const after = await transformer(content, options);

    expect(after.content).not.toBe(before.content);
    expect(after.content).not.toContain('__dumiUtoopackHMR');
    expect(
      (after.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    ).toBeUndefined();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('utoopack keeps the full-version behavior for tech stacks without opt-in', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-legacy-demo-'));
  const fileAbsPath = path.join(dir, 'index.md');
  const demoFile = path.join(dir, 'demo.jsx');
  const content = '<code src="./demo.jsx"></code>';

  fs.writeFileSync(fileAbsPath, content);
  fs.writeFileSync(demoFile, 'export default () => <div>A</div>;');

  try {
    const options = {
      ...getTransformerOptions(fileAbsPath, true),
      techStacks: [new FakeTechStack()],
    };
    const before = await transformer(content, options);

    fs.writeFileSync(demoFile, 'export default () => <div>B</div>;');

    const after = await transformer(content, options);

    expect(after.content).not.toBe(before.content);
    expect(after.content).not.toContain('__dumiUtoopackHMR');
    expect(
      (after.meta.demos[0] as any).__dumiUtoopackHMRVersion,
    ).toBeUndefined();
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
