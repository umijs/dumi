import {
  BaseAtomAssetsParser,
  createRemoteClass,
  LanguageMetaParser,
  PatchFile,
} from 'dumi';
import type { MetaCheckerOptions } from 'dumi-vue-meta';
import { createProject, dumiTransfomer } from 'dumi-vue-meta';
import path from 'path';
import { chokidar, fsExtra } from 'umi/plugin-utils';

export interface VueParserOptions {
  entryFile: string;
  resolveDir: string;
  tsconfigPath?: string;
  checkerOptions?: MetaCheckerOptions;
}

class VueMetaParser implements LanguageMetaParser {
  protected entryFile: string;
  protected resolveDir: string;
  private checkerOptions!: MetaCheckerOptions;
  private checker!: ReturnType<typeof createProject>;
  constructor(opts: VueParserOptions) {
    const { tsconfigPath, checkerOptions, resolveDir, entryFile } = opts;
    this.checkerOptions = Object.assign({}, checkerOptions);
    this.resolveDir = resolveDir;
    this.entryFile = path.resolve(this.resolveDir, entryFile);

    const realTsConfigPath =
      tsconfigPath ?? path.resolve(this.resolveDir, 'tsconfig.json');
    this.checker = createProject({
      tsconfigPath: realTsConfigPath,
      checkerOptions: this.checkerOptions,
    });
  }
  async patch(file: PatchFile) {
    const { event, fileName } = file;
    switch (event) {
      case 'add':
      case 'change': {
        const fileContent = await fsExtra.readFile(file.fileName, 'utf8');
        this.checker.patchFiles([
          { action: event, fileName: fileName, text: fileContent },
        ]);
        return;
      }
      case 'unlink':
        this.checker.deleteFile(fileName);
        return;
    }
  }
  async parse() {
    const components = this.checker.service.getComponentLibraryMeta(
      this.entryFile,
      dumiTransfomer,
    );
    return { components, functions: {} };
  }

  async destroy() {
    this.checker.close();
  }
}

const RemoteVueMetaParser = createRemoteClass(__filename, VueMetaParser);

export function createVueAtomAssetsParser(opts: VueParserOptions) {
  return new BaseAtomAssetsParser<VueMetaParser>({
    ...opts,
    parser: new RemoteVueMetaParser(opts),
    createWatcher({ parse, watchArgs }) {
      return chokidar
        .watch(watchArgs.paths, watchArgs.options)
        .on('all', (ev, file) => {
          if (
            ['add', 'change'].includes(ev) &&
            /((?<!\.d)\.ts|\.(jsx?|tsx|vue))$/.test(file)
          ) {
            this.parser.patch({
              event: ev,
              fileName: path.join(watchArgs.options.cwd as string, file),
            });
            parse();
          }
        });
    },
  });
}
