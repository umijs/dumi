import * as Comlink from 'comlink';
import nodeEndPoint from 'comlink/dist/umd/node-adapter';
import { lodash } from 'umi/plugin-utils';
import { Worker, isMainThread, parentPort } from 'worker_threads';
import {
  BaseAtomAssetsParser,
  IBaseAtomAssetsParserParams,
  ILanguageMetaParser,
} from './BaseParser';

/**
 * Only expose these methods to avoid all properties being proxied
 * @param ClassConstructor The Class to be processed
 * @param publicMethods accessible Class methods
 * @returns processed Class
 */
export function createExposedClass<
  T extends { new (...args: ConstructorParameters<T>): InstanceType<T> },
>(ClassConstructor: T, publicMethods = ['parse', 'destroy', 'patch']) {
  let realInstance: InstanceType<T>;
  const exposedClass = class {
    constructor(...params: ConstructorParameters<T>) {
      // @ts-ignore
      realInstance = new ClassConstructor(...params);
    }
  };
  publicMethods.forEach((method) => {
    Object.assign(exposedClass.prototype, {
      [method](...args: any[]) {
        // @ts-ignore
        return realInstance[method](...args);
      },
    });
  });
  return exposedClass;
}

/**
 * Create Class that can execute across threads
 * @param filename Child thread running script path
 * @param ClassConstructor Class that require remote execution
 * @param opts
 * @returns Remote Class, all its methods are asynchronous
 */
export function createRemoteClass<
  T extends { new (...args: ConstructorParameters<T>): InstanceType<T> },
>(
  filename: string,
  ClassConstructor: T,
  opts: {
    // When this method is called, the thread will be destroyed
    destroyMethod: string;
    publicMethods?: string[];
  } = { destroyMethod: 'destroy' },
) {
  if (!isMainThread) {
    if (parentPort) {
      Comlink.expose(
        createExposedClass(ClassConstructor, opts.publicMethods),
        nodeEndPoint(parentPort),
      );
    }
    return ClassConstructor;
  }
  const worker = new Worker(filename);
  const RemoteClass = Comlink.wrap<T>(nodeEndPoint(worker));
  let pendingInstance: Promise<InstanceType<T>>;
  let instance: InstanceType<T> | null = null;
  return class {
    constructor(...params: ConstructorParameters<T>) {
      // @ts-ignore
      pendingInstance = new RemoteClass(...params);
      return new Proxy(this, {
        get: (_, key) => {
          return async function (...args: any[]) {
            if (!instance) {
              instance = await pendingInstance;
            }
            const originalMethod = instance[key as keyof InstanceType<T>];
            if (lodash.isFunction(originalMethod)) {
              const p = originalMethod.apply(instance, args);
              if (key === opts.destroyMethod) {
                return p.then(async () => {
                  await worker.terminate();
                });
              }
              return p;
            }
            return originalMethod;
          };
        },
      });
    }
  } as unknown as T;
}

interface ICreateApiParserOptions<S, C> {
  /**
   * The full file name (absolute path) of the file where `parseWorker` is located
   */
  filename: string;
  /**
   * Parsing class working in worker_thead
   */
  worker: S;
  /**
   * Main thread side work, mainly to detect file changes
   */
  parseOptions?: C;
}

export interface IBaseApiParserOptions {
  entryFile: string;
  resolveDir: string;
}

/**
 * Can be used to override apiParser
 * @param options
 * @returns A function that returns a Parser instance
 * @example
 * ```ts
 * interface ParserOptions extends BaseApiParserOptions  {
 *    // other props...
 * }
 * const Parser = createApiParser({
 *    filename: __filename,
 *    worker: (class {
 *      constructor(opts: ParserOptions) {}
 *      patch () {}
 *      async parse () {
 *        return {
 *          components: {},
 *          functions: {}
 *        };
 *      }
 *      async destroy () {}
 *    }),
 *    parserOptions: {
 *      handleWatcher(watcher, { parse, patch }) {
 *        return watcher.on('all', (ev, file) => {
 *          // You can perform patch and parse operations based on file changes.
 *          // patch will transfer the corresponding file to the parseWorker,
 *          // and parse will instruct the parseWorker to parse according to updated files.
 *        });
 *      },
 *    },
 * });
 * ```
 */
export function createApiParser<
  P extends new (...args: ConstructorParameters<P>) => InstanceType<P> &
    ILanguageMetaParser,
>(
  options: ICreateApiParserOptions<P, Partial<IBaseAtomAssetsParserParams<P>>>,
) {
  const { filename, worker, parseOptions } = options;
  const ParserClass = createRemoteClass(filename, worker);
  return (...args: ConstructorParameters<P>) =>
    new BaseAtomAssetsParser({
      ...(args as any[])?.[0],
      parser: new ParserClass(...args),
      ...parseOptions,
    });
}
