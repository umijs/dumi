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

  constructor(opts: {
    entryFile: string;
    resolveDir: string;
    resolveFilter?: AtomAssetsParser['resolveFilter'];
    unpkgHost?: string;
    watch?: boolean;
  }) {
    this.resolveDir = opts.resolveDir;
    this.resolveFilter = opts.resolveFilter || (() => true);
    this.entryDir = path.relative(
      opts.resolveDir,
      path.dirname(opts.entryFile),
    );
    this.parser = new SchemaParser({
      entryPath: opts.entryFile,
      basePath: opts.resolveDir,
      unPkgHost: opts.unpkgHost ?? 'https://unpkg.com',
    });
  }

  async parse() {
    // use valid cache first
    if (!this.parseDeferrer || this.unresolvedFiles.length) {
      this.parseDeferrer = (async () => {
        // patch unresolved files, and this method also will init parser before the first time
        await this.parser.patch(this.unresolvedFiles.splice(0));

        // create resolver
        const resolver = new SchemaResolver(await this.parser.parse());

        // parse atoms from resolver
        const result: Awaited<NonNullable<AtomAssetsParser['parseDeferrer']>> =
          {
            components: {},
            functions: {},
          };
        const fallbackProps = { type: 'object', properties: {} };
        const fallbackSignature = { arguments: [] };

        resolver.componentList.forEach((id) => {
          const needResolve = this.resolveFilter({
            id,
            type: 'COMPONENT',
            ids: resolver.componentList,
          });
          let propsConfig = needResolve
            ? resolver.getComponent(id).props
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
        });

        resolver.functionList.forEach((id) => {
          const needResolve = this.resolveFilter({
            id,
            type: 'FUNCTION',
            ids: resolver.functionList,
          });
          let signature = needResolve
            ? resolver.getFunction(id).signature
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
        });

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
        .watch(this.entryDir, {
          cwd: this.resolveDir,
          ignored: [
            '**/.*',
            '**/.*/**',
            '**/_*',
            '**/_*/**',
            '**/*.{md,less,scss,sass,styl,css}',
          ],
        })
        .on('all', (ev, file) => {
          if (['add', 'change'].includes(ev) && /\.(j|t)sx?$/.test(file)) {
            this.unresolvedFiles.push(file);
            lazyParse();
          }
        });
    }
  }

  unwatch(cb: AtomAssetsParser['cbs'][number]) {
    this.cbs.splice(this.cbs.indexOf(cb), 1);
  }
}

export default AtomAssetsParser;
