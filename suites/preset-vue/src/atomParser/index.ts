import type { MetaCheckerOptions } from '@dumijs/vue-meta';
import { createProject, dumiTransfomer } from '@dumijs/vue-meta';
import {
  BaseApiParserOptions,
  LanguageMetaParser,
  PatchFile,
  createApiParser,
} from 'dumi';
import path from 'path';
import { fsExtra } from 'umi/plugin-utils';

export interface VueParserOptions extends BaseApiParserOptions {
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
        const fileContent = await fsExtra.readFile(fileName, 'utf8');
        this.checker.patchFiles([
          { action: event, fileName, text: fileContent },
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

export const VueApiParser = createApiParser({
  filename: __filename,
  worker: VueMetaParser,
  parseOptions: {
    handleWatcher(watcher, { parse, patch, watchArgs }) {
      return watcher.on('all', (ev, file) => {
        if (
          ['add', 'change', 'unlink'].includes(ev) &&
          /((?<!\.d)\.ts|\.(jsx?|tsx|vue))$/.test(file)
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
  },
});
