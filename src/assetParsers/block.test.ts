import enhancedResolve from 'enhanced-resolve';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect, test } from 'vitest';
import parseBlockAsset from './block';

test('block asset cache records the dependency content used by the parser', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-block-cache-'));
  const entryFile = path.join(dir, 'index.ts');
  const dependencyFile = path.join(dir, 'dependency.ts');
  let dependencyLoads = 0;

  fs.writeFileSync(
    entryFile,
    "import { value } from './dependency'; export default value;",
  );
  fs.writeFileSync(dependencyFile, "export const value = 'before';");

  const options = {
    fileAbsPath: entryFile,
    id: 'cache-race',
    refAtomIds: [],
    resolver: enhancedResolve.create.sync({ extensions: ['.ts', '.js'] }),
    techStack: {
      name: 'cache-race',
      runtimeOpts: {},
      onBlockLoad(args: any) {
        if (path.basename(args.path) === path.basename(dependencyFile)) {
          dependencyLoads += 1;
          if (dependencyLoads === 1) {
            fs.writeFileSync(dependencyFile, "export const value = 'after';");
          }
        }
      },
    },
    cacheable: true,
  } as any;

  try {
    await parseBlockAsset(options);
    await parseBlockAsset(options);

    expect(dependencyLoads).toBe(2);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('inline demo cache snapshots imported files instead of entry code', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-inline-cache-'));
  const entryFile = path.join(dir, 'index.ts');
  const dependencyFile = path.join(dir, 'dependency.ts');
  const entryPointCode =
    "import { value } from './dependency'; export default value;";
  const dependencyCode = "export const value = 'dependency';";
  const dependencyContents: string[] = [];

  fs.writeFileSync(dependencyFile, dependencyCode);

  const options = {
    fileAbsPath: entryFile,
    entryPointCode,
    id: 'inline-cache-race',
    refAtomIds: [],
    resolver: enhancedResolve.create.sync({ extensions: ['.ts', '.js'] }),
    techStack: {
      name: 'inline-cache-race',
      runtimeOpts: {},
      onBlockLoad(args: any) {
        if (path.basename(args.path) === path.basename(dependencyFile)) {
          dependencyContents.push(args.entryPointCode);
        }
      },
    },
    cacheable: true,
  } as any;

  try {
    await parseBlockAsset(options);
    await parseBlockAsset(options);
    await parseBlockAsset(options);

    expect(dependencyContents).toEqual([dependencyCode]);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('empty inline demo does not register its virtual entry as a source file', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-empty-inline-'));
  const entryFile = path.join(dir, 'index.ts');

  try {
    const result = await parseBlockAsset({
      fileAbsPath: entryFile,
      entryPointCode: '',
      id: 'empty-inline',
      refAtomIds: [],
      resolver: enhancedResolve.create.sync({ extensions: ['.ts', '.js'] }),
      techStack: { name: 'empty-inline', runtimeOpts: {} },
      cacheable: false,
    } as any);

    expect(result.resolveMap).toEqual({});
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
