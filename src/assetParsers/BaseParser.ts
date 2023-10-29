import type { AtomAssetsParser, AtomAssetsParserResult } from '@/types';
import path from 'path';
import { chokidar, lodash, logger } from 'umi/plugin-utils';

export interface PatchFile {
  event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
  fileName: string;
}

/**
 * The parsing and extraction of language metadata should be implemented separately
 */
export interface LanguageMetaParser {
  patch(file: PatchFile): void;
  parse(): Promise<AtomAssetsParserResult>;
  destroy(): Promise<void>;
}

export interface CreateWatcherOptions {
  parse: () => void;
  watchArgs: {
    paths: string | string[];
    options: chokidar.WatchOptions;
  };
}

export interface BaseAtomAssetsParserParams<T> {
  entryFile: string;
  resolveDir: string;
  parser: T;
  createWatcher?: (options: CreateWatcherOptions) => chokidar.FSWatcher;
  watchOptions?: chokidar.WatchOptions;
}

export class BaseAtomAssetsParser<T extends LanguageMetaParser>
  implements AtomAssetsParser
{
  private watchArgs!: CreateWatcherOptions['watchArgs'];

  private watcher: chokidar.FSWatcher | null = null;
  private createWatcher!: BaseAtomAssetsParserParams<T>['createWatcher'];

  protected entryFile!: string;
  protected entryDir!: string;
  protected resolveDir!: string;

  protected parser!: T;
  protected isParsing = false;
  private parseDeferrer: Promise<AtomAssetsParserResult> | null = null;
  private cbs: Array<(data: AtomAssetsParserResult) => void> = [];

  constructor(opts: BaseAtomAssetsParserParams<T>) {
    const { entryFile, resolveDir, watchOptions, parser, createWatcher } = opts;
    this.entryFile = entryFile;
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
    if (createWatcher) {
      this.createWatcher = createWatcher;
    }
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

  public watch(cb: (data: AtomAssetsParserResult) => void): void {
    // save watch callback
    this.cbs.push(cb);
    // initialize watcher
    if (!this.watcher && this.createWatcher) {
      const lazyParse = lodash.debounce(() => {
        this.parse()
          .then((data) => this.cbs.forEach((cb) => cb(data)))
          .catch((err) => {
            logger.error(err);
          });
      }, 100);

      this.watcher = this.createWatcher({
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
      });
      lazyParse();
    }
  }

  public unwatch(cb: (data: AtomAssetsParserResult) => void) {
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
