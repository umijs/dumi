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
    });
    ctx.opts = Object.assign({}, ctx.opts, {
      resolve: { previewLangs: ['jsx', 'tsx'] },
    });
  });

  it('should load normal md', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath).toString(),
    );

    // expect prepend demos
    expect(result).toContain("const DumiDemo1 = React.memo(require('@@/dumi/demos')");

    // expect import components from theme package
    expect(result).toContain("from 'dumi-theme-default");
  });

  it('should load normal md without Katex style in production', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const oEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'production';
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath).toString(),
    );
    process.env.NODE_ENV = oEnv;

    // expect import Katex css file
    expect(result).not.toContain("import 'katex");
  });

  it('should load math md with Katex style', async () => {
    const filePath = path.join(fixture, 'katex.md');
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath).toString(),
    );

    // expect import Katex css file
    expect(result).toContain("import 'katex");
  });

  it('should load part of md by range', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const singleLine = await loader.call(
      { resource: filePath, resourcePath: filePath, resourceQuery: '?range=L1' },
      fs.readFileSync(filePath).toString(),
    );
    const rangeLines = await loader.call(
      { resource: filePath, resourcePath: filePath, resourceQuery: '?range=L3-L5' },
      fs.readFileSync(filePath).toString(),
    );

    // expect get correct line
    expect(singleLine).toContain('id="hello-world"');

    // expect get single line
    expect(singleLine.match(/<>([^]+)<\/>/)[1].replace(/^[\s\n]*|[\s\n]*$/g, '')).not.toContain(
      '\n',
    );

    // expect parse previewer
    expect(rangeLines).toContain('Previewer');
  });
});
