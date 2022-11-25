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
  private resolverDeferrer: Promise<SchemaResolver> | undefined;
  private watcher: chokidar.FSWatcher | null = null;
  private cbs: Array<
    (data: Awaited<ReturnType<AtomAssetsParser['parse']>>) => void
  > = [];

  constructor(opts: {
    entryFile: string;
    resolveDir: string;
    unpkgHost?: string;
    watch?: boolean;
  }) {
    this.resolveDir = opts.resolveDir;
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
    if (!this.resolverDeferrer || this.unresolvedFiles.length) {
      this.resolverDeferrer = (async () => {
        // patch unresolved files, and this method also will init parser before the first time
        await this.parser.patch(this.unresolvedFiles);

        return new SchemaResolver(await this.parser.parse());
      })();
    }

    return this.resolverDeferrer.then((resolver) => {
      const components: Record<string, AtomComponentAsset> = {};
      const functions: Record<string, AtomFunctionAsset> = {};

      resolver.componentList.forEach((id) => {
        let propsConfig = resolver.getComponent(id).props;
        const size = Buffer.byteLength(JSON.stringify(propsConfig));

        if (size > MAX_PARSE_SIZE) {
          propsConfig = { type: 'object', properties: {} };
          logger.warn(
            `Parsed component ${id} props size ${size} exceeds 512KB, skip it.`,
          );
        }

        components[id] = {
          type: 'COMPONENT',
          id,
          title: id,
          propsConfig,
        };
      });

      resolver.functionList.forEach((id) => {
        let signature = resolver.getFunction(id).signature;
        const size = Buffer.byteLength(JSON.stringify(signature));

        if (size > MAX_PARSE_SIZE) {
          signature = { arguments: [] };
          logger.warn(
            `Parsed function ${id} signature size ${size} exceeds 512KB, skip it.`,
          );
        }

        functions[id] = {
          type: 'FUNCTION',
          id,
          title: id,
          signature,
        };
      });

      return { components, functions };
    });
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
}

export default AtomAssetsParser;
