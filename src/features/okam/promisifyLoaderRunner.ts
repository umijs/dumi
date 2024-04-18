import { promisify } from 'util';
import type {
  RunLoaderOption as InternalRunLoaderOption,
  RunLoaderResult,
} from '../../../compiled/loader-runner';
import {
  runLoaders as callbackRunLoaders,
  getContext,
} from '../../../compiled/loader-runner';
export type * from '../../../compiled/loader-runner';
export { getContext, runLoaders };

const promisifyRunLoaders = promisify(callbackRunLoaders);

type RunLoaderOption = Partial<InternalRunLoaderOption>;

function runLoaders(options: RunLoaderOption): Promise<RunLoaderResult>;
function runLoaders(
  options: RunLoaderOption,
  callback: undefined,
): Promise<RunLoaderResult>;
function runLoaders(
  options: RunLoaderOption,
  callback: (err: NodeJS.ErrnoException | null, result: RunLoaderResult) => any,
): void;
function runLoaders(
  options: RunLoaderOption,
  callback?: (
    err: NodeJS.ErrnoException | null,
    result: RunLoaderResult,
  ) => any,
) {
  if (callback !== undefined) {
    return callbackRunLoaders(options as InternalRunLoaderOption, callback);
  }
  return promisifyRunLoaders(options as InternalRunLoaderOption);
}
