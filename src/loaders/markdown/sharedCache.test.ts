import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { vi } from 'vitest';
import { getOrCreateWithFileLock } from './sharedCache';

const execFileAsync = promisify(execFile);

test('markdown transforms are created once across loader processes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-single-flight-'));
  const worker = path.join(__dirname, 'fixtures/sharedCacheWorker.cjs');
  const lockPath = path.join(dir, 'transform.lock');
  const valuePath = path.join(dir, 'transform.json');
  const countPath = path.join(dir, 'transform-count.txt');

  try {
    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        execFileAsync(process.execPath, [
          worker,
          lockPath,
          valuePath,
          countPath,
        ]),
      ),
    );

    expect(fs.readFileSync(countPath, 'utf-8').trim().split('\n')).toHaveLength(
      1,
    );
    expect(new Set(results.map(({ stdout }) => stdout.trim())).size).toBe(1);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('separate dev sessions do not share transform locks or results', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-sessions-'));
  const worker = path.join(__dirname, 'fixtures/sharedCacheWorker.cjs');
  const runSession = async (epoch: string) => {
    const sessionDir = path.join(dir, epoch);

    fs.mkdirSync(sessionDir, { recursive: true });

    const args = [
      worker,
      path.join(sessionDir, 'transform.lock'),
      path.join(sessionDir, 'transform.json'),
      path.join(sessionDir, 'transform-count.txt'),
    ];
    const results = await Promise.all(
      Array.from({ length: 2 }, () => execFileAsync(process.execPath, args)),
    );

    return {
      count: fs.readFileSync(args[3], 'utf-8').trim().split('\n').length,
      values: new Set(results.map(({ stdout }) => stdout.trim())),
    };
  };

  try {
    const [first, second] = await Promise.all([
      runSession('epoch-a'),
      runSession('epoch-b'),
    ]);

    expect(first.count).toBe(1);
    expect(second.count).toBe(1);
    expect(first.values.size).toBe(1);
    expect(second.values.size).toBe(1);
    expect(first.values).not.toEqual(second.values);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('a failed transform releases the cross-process lock', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-single-flight-'));
  const lockPath = path.join(dir, 'transform.lock');
  const setValue = vi.fn();

  try {
    await expect(
      getOrCreateWithFileLock({
        lockPath,
        getValue: () => undefined,
        createValue: async () => {
          throw new Error('transform failed');
        },
        setValue,
      }),
    ).rejects.toThrow('transform failed');
    expect(setValue).not.toHaveBeenCalled();

    await expect(
      getOrCreateWithFileLock({
        lockPath,
        getValue: () => undefined,
        createValue: async () => 'compiled',
        setValue,
      }),
    ).resolves.toBe('compiled');
    expect(setValue).toHaveBeenCalledWith('compiled');
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('non-lock filesystem errors fail without retrying forever', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-md-single-flight-'));
  const parentFile = path.join(dir, 'not-a-directory');

  fs.writeFileSync(parentFile, 'file');

  try {
    await expect(
      getOrCreateWithFileLock({
        lockPath: path.join(parentFile, 'transform.lock'),
        getValue: () => undefined,
        createValue: async () => 'compiled',
        setValue: () => {},
      }),
    ).rejects.toBeInstanceOf(Error);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
