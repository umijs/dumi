import type { AtomComponentAsset, AtomFunctionAsset } from 'dumi-assets-types';
import path from 'path';
import { chokidar, lodash, logger } from 'umi/plugin-utils';

export interface IPatchFile {
  event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
  fileName: string;
}

export interface IAtomAssetsParserResult {
  components: Record<string, AtomComponentAsset>;
  functions: Record<string, AtomFunctionAsset>;
}

/**
 * The parsing and extraction of language metadata should be implemented separately
 */
export interface ILanguageMetaParser {
  patch(file: IPatchFile): void;
  parse(): Promise<IAtomAssetsParserResult>;
  destroy(): Promise<void>;
}

export interface IHandleWatcherArgs {
  patch: ILanguageMetaParser['patch'];
  parse: () => void;
  watchArgs: {
    paths: string | string[];
    options: chokidar.WatchOptions;
  };
}

export interface IBaseAtomAssetsParserParams<T> {
  entryFile: string;
  resolveDir: string;
  parser: T;
  handleWatcher?: (
    watcher: chokidar.FSWatcher,
    params: IHandleWatcherArgs,
  ) => chokidar.FSWatcher;
  watchOptions?: chokidar.WatchOptions;
}

export class BaseAtomAssetsParser<
  T extends ILanguageMetaParser = ILanguageMetaParser,
> {
  private watchArgs!: IHandleWatcherArgs['watchArgs'];

  private watcher: chokidar.FSWatcher | null = null;
  private handleWatcher?: IBaseAtomAssetsParserParams<T>['handleWatcher'];

  private entryDir!: string;
  private resolveDir!: string;

  private readonly parser!: T;
  private isParsing = false;
  private parseDeferrer: Promise<IAtomAssetsParserResult> | null = null;
  private cbs: Array<(data: IAtomAssetsParserResult) => void> = [];

  constructor(opts: IBaseAtomAssetsParserParams<T>) {
    const { entryFile, resolveDir, watchOptions, parser, handleWatcher } = opts;
    this.resolveDir = resolveDir;
    const absEntryFile = path.resolve(resolveDir, entryFile);
    this.entryDir = path.relative(opts.resolveDir, path.dirname(absEntryFile));

    this.watchArgs = {
      paths: this.entryDir,
      options: {
        cwd: this.resolveDir,
        ignored: [
          '**/.*',
          '**/.*/**',
          '**/_*',
          '**/_*/**',
          '**/*.{md,less,scss,sass,styl,css}',
        ],
        ignoreInitial: true,
        ...watchOptions,
      },
    };
    this.handleWatcher = handleWatcher;
    this.parser = parser;
  }

  public async parse() {
    if (!this.parseDeferrer) {
      this.isParsing = true;
      this.parseDeferrer = this.parser.parse().finally(() => {
        this.isParsing = false;
      });
    }
    return this.parseDeferrer;
  }

  public watch(cb: (data: IAtomAssetsParserResult) => void): void {
    // save watch callback
    this.cbs.push(cb);
    // initialize watcher
    if (!this.watcher && this.handleWatcher) {
      const lazyParse = lodash.debounce(() => {
        this.parse()
          .then((data) => this.cbs.forEach((cb) => cb(data)))
          .catch((err) => {
            logger.error(err);
          });
      }, 100);

      this.watcher = chokidar.watch(
        this.watchArgs.paths,
        this.watchArgs.options,
      );

      this.handleWatcher(this.watcher, {
        parse: () => {
          if (this.isParsing && this.parseDeferrer) {
            this.parseDeferrer.finally(() => {
              this.parseDeferrer = null;
              lazyParse();
            });
          } else {
            this.parseDeferrer = null;
            lazyParse();
          }
        },
        watchArgs: this.watchArgs,
        patch: (file: IPatchFile) => {
          this.parser.patch(file);
        },
      });

      lazyParse();
    }
  }

  public unwatch(cb: (data: IAtomAssetsParserResult) => void) {
    this.cbs.splice(this.cbs.indexOf(cb), 1);
  }

  public patchWatchArgs(
    handler: (
      args: BaseAtomAssetsParser<T>['watchArgs'],
    ) => BaseAtomAssetsParser<T>['watchArgs'],
  ) {
    this.watchArgs = handler(this.watchArgs);
  }

  public getWatchArgs() {
    return this.watchArgs;
  }

  public async destroyWorker() {
    // wait for current parse finished
    if (this.parseDeferrer) {
      await this.parseDeferrer;
      this.parseDeferrer = null;
    }
    await this.parser.destroy();
  }
}

export type IAtomAssetsParser = InstanceType<typeof BaseAtomAssetsParser>;
