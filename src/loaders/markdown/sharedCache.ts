import fs from 'fs';
import path from 'path';
import { lock } from 'proper-lockfile';

interface ISharedCacheOptions<T> {
  lockPath: string;
  getValue: () => T | undefined | Promise<T | undefined>;
  createValue: () => Promise<T>;
  setValue: (value: T) => void;
  retryMs?: number;
  staleMs?: number;
  lockTimeoutMs?: number;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function acquireFileLock(
  lockPath: string,
  retryMs: number,
  staleMs: number,
  lockTimeoutMs: number,
  onCompromised: (err: Error) => void,
) {
  const deadline = Date.now() + lockTimeoutMs;

  while (true) {
    try {
      return await lock(lockPath, {
        lockfilePath: lockPath,
        onCompromised,
        realpath: false,
        stale: staleMs,
        update: Math.min(10 * 1000, staleMs / 2),
      });
    } catch (err: any) {
      if (err?.code !== 'ELOCKED') throw err;

      if (Date.now() >= deadline) {
        throw Object.assign(
          new Error(`Timed out waiting for cache lock: ${lockPath}`),
          { cause: err, code: 'ELOCKTIMEOUT' },
        );
      }

      await delay(retryMs + Math.floor(Math.random() * retryMs));
    }
  }
}

export async function getOrCreateWithFileLock<T>({
  lockPath,
  getValue,
  createValue,
  setValue,
  retryMs = 20,
  staleMs = 5 * 60 * 1000,
  lockTimeoutMs = 10 * 60 * 1000,
}: ISharedCacheOptions<T>): Promise<T> {
  const cached = await getValue();

  if (cached !== undefined) return cached;

  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  let compromisedError: Error | undefined;
  const release = await acquireFileLock(
    lockPath,
    retryMs,
    staleMs,
    lockTimeoutMs,
    (err) => {
      compromisedError = err;
    },
  );

  let result!: T;
  let operationError: unknown;
  let hasOperationError = false;

  try {
    const lockedCache = await getValue();
    if (lockedCache === undefined) {
      const created = await createValue();

      if (compromisedError) throw compromisedError;

      setValue(created);
      result = created;
    } else {
      result = lockedCache;
    }
  } catch (err) {
    operationError = err;
    hasOperationError = true;
  }

  let releaseError: unknown;
  let hasReleaseError = false;

  try {
    await release();
  } catch (err: any) {
    if (!compromisedError || err?.code !== 'ERELEASED') {
      releaseError = err;
      hasReleaseError = true;
    }
  }

  if (compromisedError && !hasOperationError) {
    operationError = compromisedError;
    hasOperationError = true;
  }

  if (hasOperationError) throw operationError;
  if (hasReleaseError) throw releaseError;

  return result;
}
