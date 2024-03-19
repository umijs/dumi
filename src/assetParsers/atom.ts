import { getProjectRoot } from '@/utils';
import { SchemaParser, SchemaResolver } from 'dumi-afx-deps/compiled/parser';
import path from 'path';
import { logger } from 'umi/plugin-utils';
import {
  BaseAtomAssetsParser,
  IAtomAssetsParserResult,
  ILanguageMetaParser,
  IPatchFile,
} from './BaseParser';

// maximum support 512kb for each atoms
const MAX_PARSE_SIZE = 1024 * 512;

interface ParserParams {
  entryFile: string;
  resolveDir: string;
  resolveFilter?: ReactMetaParser['resolveFilter'];
  unpkgHost?: string;
  parseOptions?: object;
}

class ReactMetaParser implements ILanguageMetaParser {
  private parser: SchemaParser;
  private resolveFilter: (args: {
    type: 'COMPONENT' | 'FUNCTION';
    id: string;
    ids: string[];
  }) => boolean;
  private unresolvedFiles: string[] = [];

  constructor(opts: ParserParams) {
    const { resolveDir, entryFile, parseOptions, unpkgHost } = opts;
    const absEntryFile = path.resolve(resolveDir, entryFile);
    this.resolveFilter = opts.resolveFilter || (() => true);
    this.parser = new SchemaParser({
      entryPath: absEntryFile,
      basePath: getProjectRoot(resolveDir),
      unPkgHost: unpkgHost ?? 'https://unpkg.com',
      mode: 'worker',
      // @ts-ignore
      parseOptions: parseOptions,
    });
  }

  public async parse() {
    // patch unresolved files, and this method also will init parser before the first time
    await this.parser.patch(this.unresolvedFiles.splice(0));

    // create resolver
    const resolver = new SchemaResolver(await this.parser.parse(), {
      mode: 'worker',
    });

    // parse atoms from resolver
    const result: IAtomAssetsParserResult = {
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
    return result;
  }
  public destroy() {
    return this.parser.$$destroyWorker();
  }

  public patch(file: IPatchFile): void {
    this.unresolvedFiles.push(file.fileName);
  }
}

class ReactAtomAssetsParser extends BaseAtomAssetsParser<ReactMetaParser> {
  constructor(opts: ParserParams) {
    super({
      ...opts,
      parser: new ReactMetaParser(opts),
      handleWatcher: (watcher, { parse, patch, watchArgs }) => {
        return watcher.on('all', (ev, file) => {
          if (
            ['add', 'change'].includes(ev) &&
            /((?<!\.d)\.ts|\.(jsx?|tsx))$/.test(file)
          ) {
            const cwd = watchArgs.options.cwd!;
            patch({
              event: ev,
              fileName: path.join(cwd, file),
            });
            parse();
          }
        });
      },
    });
  }
}

export default ReactAtomAssetsParser;
