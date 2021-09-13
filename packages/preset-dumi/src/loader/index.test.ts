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
    expect(result).toContain('const DumiDemo1 = React.memo(DUMI_ALL_DEMOS');

    // expect import components from theme package
    expect(result).toContain("from 'dumi-theme-default");

    // show default translateHelp
    expect(result).toContain(
      'This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.',
    );
  });

  it('should load customize md', async () => {
    const filePath = path.join(fixture, 'customize.md');
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath, 'utf8').toString(),
    );

    // show customize translateHelp
    expect(result).toContain('Customize Help!');
  });

  it('should load passive md', async () => {
    ctx.opts.resolve.passivePreview = true;

    const filePath = path.join(fixture, 'passive.md');
    const result = await loader.call(
      { resource: filePath, resourcePath: filePath },
      fs.readFileSync(filePath, 'utf8').toString(),
    );

    expect(result).toContain('const DumiDemo1 = React.memo(DUMI_ALL_DEMOS');
    expect(result).toContain('const DumiDemo2 = React.memo(DUMI_ALL_DEMOS');
    expect(result).not.toContain('const DumiDemo3 = React.memo(DUMI_ALL_DEMOS');
    expect(result).not.toContain('const DumiDemo4 = React.memo(DUMI_ALL_DEMOS');
    expect(result).not.toContain('const DumiDemo5 = React.memo(DUMI_ALL_DEMOS');

    // expect import components from theme package
    expect(result).toContain("from 'dumi-theme-default");

    // show default translateHelp
    expect(result).toContain(
      'This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.',
    );

    ctx.opts.resolve.passivePreview = false;
  });

  it('should load part of md by range', async () => {
    const filePath = path.join(fixture, 'normal.md');
    const singleLine = await loader.call(
      { resource: `${filePath}?range=L5`, resourcePath: filePath, resourceQuery: '?range=L5' },
      fs.readFileSync(filePath, 'utf8').toString(),
    );
    const rangeLines = await loader.call(
      {
        resource: `${filePath}?range=L7-L9`,
        resourcePath: filePath,
        resourceQuery: '?range=L7-L9',
      },
      fs.readFileSync(filePath, 'utf8').toString(),
    );
    const fallbackFullContent = await loader.call(
      {
        resource: `${filePath}?range=LA-LB`,
        resourcePath: filePath,
        resourceQuery: '?range=LA-LB',
      },
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
        resource: `${filePath}?regexp=${encodeURIComponent('/[\\r\\n]```[^]+?[\\r\\n]```/')}`,
        resourcePath: filePath,
        resourceQuery: `?regexp=${encodeURIComponent('/[\\r\\n]```[^]+?[\\r\\n]```/')}`,
      },
      fs.readFileSync(filePath, 'utf8').toString(),
    );
    const fallbackLines = await loader.call(
      {
        resource: `${filePath}?regexp=${encodeURIComponent('/<abc \\/>/')}`,
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

  it('should handle slug conflicts between embeded files', async () => {
    const filePath = path.join(fixture, 'embed.md');
    const tester = async () => {
      const masterResult: string = await loader.call(
        { resource: filePath, resourcePath: filePath },
        fs.readFileSync(filePath, 'utf8').toString(),
      );
      const embedFiles = masterResult
        .match(/require\('[^']+'\)/g)
        .map(str => str.match(/'([^']+)'/)[1]);
      const embedResultDefers = embedFiles.map(src => {
        const [, embedFilePath, embedQuery] = src.match(/^([^?]+)(\?.*)$/);

        return loader.call(
          {
            resource: src,
            resourcePath: embedFilePath,
            resourceQuery: embedQuery,
          },
          fs.readFileSync(embedFilePath, 'utf8').toString(),
        );
      });

      await Promise.all(embedResultDefers).then(embedResults => {
        embedResults[0].includes('"#hello-world"');
        embedResults[1].includes('"#hello-world-1"');
        embedResults[2].includes('"#hello-world-2"');
      });
    };

    // first compile
    await tester();

    // HMR compile
    await tester();

    // HMR compile again
    await tester();
  });
});
