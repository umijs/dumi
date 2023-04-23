import { getProjectRoot } from '@/utils';
import { SchemaParser, SchemaResolver } from 'dumi-afx-deps/compiled/parser';
import { AtomComponentAsset, AtomFunctionAsset } from 'dumi-assets-types';
import path from 'path';
import { chokidar, lodash, logger } from 'umi/plugin-utils';

// maximum support 512kb for each atoms
const MAX_PARSE_SIZE = 1024 * 512;

class AtomAssetsParser {
  private entryDir: string;
  private resolveDir: string;
  private unresolvedFiles: string[] = [];
  private parser: SchemaParser;
  private isParsing = false;
  private parseDeferrer:
    | Promise<{
        components: Record<string, AtomComponentAsset>;
        functions: Record<string, AtomFunctionAsset>;
      }>
    | undefined;
  private watcher: chokidar.FSWatcher | null = null;
  private cbs: Array<
    (data: Awaited<ReturnType<AtomAssetsParser['parse']>>) => void
  > = [];
  private resolveFilter: (args: {
    type: 'COMPONENT' | 'FUNCTION';
    id: string;
    ids: string[];
  }) => boolean;
  private watchArgs: {
    paths: string | string[];
    options: chokidar.WatchOptions;
  };

  constructor(opts: {
    entryFile: string;
    resolveDir: string;
    resolveFilter?: AtomAssetsParser['resolveFilter'];
    unpkgHost?: string;
    watch?: boolean;
    parseOptions?: object;
  }) {
    const absEntryFile = path.resolve(opts.resolveDir, opts.entryFile);

    this.resolveDir = opts.resolveDir;
    this.resolveFilter = opts.resolveFilter || (() => true);
    this.entryDir = path.relative(opts.resolveDir, path.dirname(absEntryFile));
    this.parser = new SchemaParser({
      entryPath: absEntryFile,
      basePath: getProjectRoot(opts.resolveDir),
      unPkgHost: opts.unpkgHost ?? 'https://unpkg.com',
      mode: 'worker',
      // @ts-ignore
      parseOptions: opts.parseOptions,
    });
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
      },
    };
  }

  async parse() {
    // use cache first, and only one parse task can be running at the same time
    // FIXME: result may outdated
    if (
      !this.parseDeferrer ||
      (this.unresolvedFiles.length && !this.isParsing)
    ) {
      this.isParsing = true;
      this.parseDeferrer = (async () => {
        // patch unresolved files, and this method also will init parser before the first time
        await this.parser.patch(this.unresolvedFiles.splice(0));

        // create resolver
        const resolver = new SchemaResolver(await this.parser.parse(), {
          mode: 'worker',
        });

        // parse atoms from resolver
        const result: Awaited<NonNullable<AtomAssetsParser['parseDeferrer']>> =
          {
            components: {},
            functions: {},
          };
        const fallbackProps = { type: 'object', properties: {} };
        const fallbackSignature = { arguments: [] };
        const componentList = await resolver.componentList;
        const functionList = await resolver.functionList;

        for (const id of componentList) {
          const needResolve = this.resolveFilter({
            id,
            type: 'COMPONENT',
            ids: componentList,
          });
          let propsConfig = needResolve
            ? (await resolver.getComponent(id)).props
            : fallbackProps;
          const size = Buffer.byteLength(JSON.stringify(propsConfig));

          if (size > MAX_PARSE_SIZE) {
            propsConfig = fallbackProps;
            logger.warn(
              `Parsed component ${id} props size ${size} exceeds 512KB, skip it.`,
            );
          }

          result.components[id] = {
            type: 'COMPONENT',
            id,
            title: id,
            propsConfig,
          };
        }

        for (const id of functionList) {
          const needResolve = this.resolveFilter({
            id,
            type: 'FUNCTION',
            ids: functionList,
          });
          let signature = needResolve
            ? (await resolver.getFunction(id)).signature
            : fallbackSignature;
          const size = Buffer.byteLength(JSON.stringify(signature));

          if (size > MAX_PARSE_SIZE) {
            signature = fallbackSignature;
            logger.warn(
              `Parsed function ${id} signature size ${size} exceeds 512KB, skip it.`,
            );
          }

          result.functions[id] = {
            type: 'FUNCTION',
            id,
            title: id,
            signature,
          };
        }

        // reset status after parse finished
        resolver.$$destroyWorker();
        this.isParsing = false;

        return result;
      })();
    }

    return this.parseDeferrer;
  }

  watch(cb: AtomAssetsParser['cbs'][number]) {
    // save watch callback
    this.cbs.push(cb);

    // initialize watcher
    if (!this.watcher) {
      const lazyParse = lodash.debounce(() => {
        this.parse().then((data) => this.cbs.forEach((cb) => cb(data)));
      }, 100);

      this.watcher = chokidar
        .watch(this.watchArgs.paths, this.watchArgs.options)
        .on('all', (ev, file) => {
          if (
            ['add', 'change'].includes(ev) &&
            /((?<!\.d)\.ts|\.(jsx?|tsx))$/.test(file)
          ) {
            this.unresolvedFiles.push(path.join(this.watchArgs.options.cwd, file));
            lazyParse();
          }
        });
      lazyParse();
    }
  }

  unwatch(cb: AtomAssetsParser['cbs'][number]) {
    this.cbs.splice(this.cbs.indexOf(cb), 1);
  }

  patchWatchArgs(
    handler: (
      args: AtomAssetsParser['watchArgs'],
    ) => AtomAssetsParser['watchArgs'],
  ) {
    this.watchArgs = handler(this.watchArgs);
  }

  destroyWorker() {
    // wait for current parse finished
    if (this.parseDeferrer) {
      this.parseDeferrer.finally(() => this.parser.$$destroyWorker());
    } else {
      this.parser.$$destroyWorker();
    }
  }
}

export default AtomAssetsParser;
