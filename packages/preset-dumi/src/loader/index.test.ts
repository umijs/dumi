import fs from 'fs';
import path from 'path';
import ctx from '../context';
import loader from '.';

describe('loader', () => {
  const fixture = path.join(__dirname, 'fixtures');

  beforeAll(() => {
    ctx.umi = Object.assign({}, ctx.umi, {
      cwd: __dirname,
      paths: { cwd: process.cwd(), absNodeModulesPath: '' },
      ApplyPluginsType: {},
      applyPlugins: ({ initialValue }) => initialValue,
      logger: console,
    });
    ctx.opts = Object.assign({}, ctx.opts, {
      resolve: { previewLangs: ['jsx', 'tsx'] },
    });
  });

  it('should load normal md', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath, 'utf8').toString(),
    );

    // expect prepend demos
    expect(result).toContain("const DumiDemo1 = React.memo(require('@@/dumi/demos')");

    // expect import components from theme package
    expect(result).toContain("from 'dumi-theme-default");

    // show default translateHelp
    expect(result).toContain("This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.");
  });

  it('should load customize md', async () => {
    const filePath = path.join(fixture, 'customize.md');
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath, 'utf8').toString(),
    );

    // show customize translateHelp
    expect(result).toContain("Customize Help!");
  });

  it('should load normal md without Katex style in production', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const oEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'production';
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath, 'utf8').toString(),
    );
    process.env.NODE_ENV = oEnv;

    // expect import Katex css file
    expect(result).not.toContain("import 'katex");
  });

  it('should load math md with Katex style', async () => {
    const filePath = path.join(fixture, 'katex.md');
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath, 'utf8').toString(),
    );

    // expect import Katex css file
    expect(result).toContain("import 'katex");
  });

  it('should load part of md by range', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const singleLine = await loader.call(
      { resource: filePath, resourcePath: filePath, resourceQuery: '?range=L5' },
      fs.readFileSync(filePath, 'utf8').toString(),
    );
    const rangeLines = await loader.call(
      { resource: filePath, resourcePath: filePath, resourceQuery: '?range=L7-L9' },
      fs.readFileSync(filePath, 'utf8').toString(),
    );
    const fallbackFullContent =  await loader.call(
      { resource: filePath, resourcePath: filePath, resourceQuery: '?range=LA-LB' },
      fs.readFileSync(filePath, 'utf8').toString(),
    );

    // expect get correct line
    expect(singleLine).toContain('id="hello-world"');

    // expect get single line
    expect(singleLine.match(/<>([^]+)<\/>/)[1].replace(/^[\s\n]*|[\s\n]*$/g, '')).not.toContain(
      '\n',
    );

    // expect parse previewer
    expect(rangeLines).toContain('Previewer');

    // expect fallback full content if line is invalid
    expect(fallbackFullContent).toContain('Previewer');
    expect(fallbackFullContent).toContain('id="hello-world"');
  });

  it('should load part of md by regexp', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const codeLines = await loader.call(
      {
        resource: filePath,
        resourcePath: filePath,
        resourceQuery: `?regexp=${encodeURIComponent('/[\\r\\n]```[^]+?[\\r\\n]```/')}`,
      },
      fs.readFileSync(filePath, 'utf8').toString(),
    );
    const fallbackLines = await loader.call(
      {
        resource: filePath,
        resourcePath: filePath,
        resourceQuery: `?regexp=${encodeURIComponent('/<abc \\/>/')}`,
      },
      fs.readFileSync(filePath, 'utf8').toString(),
    );

    // expect not include title
    expect(codeLines).not.toContain('id="hello-world"');

    // expect fallback parse code to previewer
    expect(codeLines).toContain('Previewer');

    // expect fallback not include title
    expect(fallbackLines).toContain('id="hello-world"');

    // expect fallback parse code to previewer
    expect(fallbackLines).toContain('Previewer');
  });
});
