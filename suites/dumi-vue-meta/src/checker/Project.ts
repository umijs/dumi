import type {
  ParsedCommandLine,
  TypeScriptLanguageHost,
} from '@vue/language-core';
import { resolveVueCompilerOptions } from '@vue/language-core';
import * as path from 'typesafe-path/posix';
import type ts from 'typescript/lib/tsserverlibrary';
import type { MetaCheckerOptions } from '../types';
import { getPosixPath } from '../utils';
import { TypeCheckService } from './TypeCheckService';
import { createRepo } from './repo';

type PatchAction = 'add' | 'update' | 'change' | 'unlink' | 'remove';

/**
 * Used to create checker project.
 * In addition to providing checker services, it can also manipulate files in the project.
 */
export class Project {
  private parsedCommandLine!: ParsedCommandLine;
  private fileNames!: Set<path.PosixPath>;
  private projectVersion = 0;
  private scriptSnapshots = new Map<string, ts.IScriptSnapshot>();

  /**
   * checker service
   */
  public service!: TypeCheckService;

  constructor(
    private loadParsedCommandLine: () => ParsedCommandLine,
    private ts: typeof import('typescript/lib/tsserverlibrary'),
    checkerOptions: MetaCheckerOptions,
    private rootPath: string,
    private globalComponentName: string,
  ) {
    this.loadFileNames();
    const _host: TypeScriptLanguageHost = {
      workspacePath: rootPath,
      rootPath,
      getProjectVersion: () => this.projectVersion.toString(),
      // @ts-ignore
      getCompilationSettings: () => this.parsedCommandLine.options,
      getScriptFileNames: () => [...this.fileNames],
      getProjectReferences: () => this.parsedCommandLine.projectReferences,
      getScriptSnapshot: (fileName) => {
        if (!this.scriptSnapshots.has(fileName)) {
          const fileText = ts.sys.readFile(fileName);
          if (fileText !== undefined) {
            this.scriptSnapshots.set(
              fileName,
              ts.ScriptSnapshot.fromString(fileText),
            );
          }
        }
        return this.scriptSnapshots.get(fileName);
      },
    };
    const repo = createRepo(rootPath, this.fileNames, checkerOptions);
    this.service = new TypeCheckService(
      ts,
      checkerOptions,
      resolveVueCompilerOptions(this.parsedCommandLine.vueOptions),
      globalComponentName,
      _host,
      repo,
    );
  }

  /**
   * Get type checker service {@link TypeCheckService}
   */
  public getService() {
    return this.service;
  }

  public updateFile(fileName: string, text: string) {
    const { ts } = this;
    const posixFileName = getPosixPath(fileName);
    this.scriptSnapshots.set(posixFileName, ts.ScriptSnapshot.fromString(text));
    this.projectVersion++;
  }

  public addFile(fileName: string, text: string) {
    const posixFileName = getPosixPath(fileName);
    this.fileNames.add(posixFileName);
    this.updateFile(fileName, text);
  }

  public deleteFile(fileName: string) {
    const posixFileName = getPosixPath(fileName);
    this.fileNames.delete(posixFileName);
    this.projectVersion++;
  }

  /**
   * Manipulate files in batches
   */
  public patchFiles(
    files: { action: PatchAction; fileName: string; text?: string }[],
  ) {
    files.forEach(({ action, fileName, text }) => {
      switch (action) {
        case 'add':
        case 'update':
        case 'change':
          this.updateFile(fileName, text!);
          return;
        default:
          this.deleteFile(fileName);
          return;
      }
    });
  }

  private loadFileNames() {
    this.parsedCommandLine = this.loadParsedCommandLine();
    this.fileNames = (this.parsedCommandLine.fileNames as path.OsPath[]).reduce(
      (names, fileName) => {
        names.add(getPosixPath(fileName));
        return names;
      },
      new Set<path.PosixPath>(),
    );
  }

  public reload() {
    this.loadFileNames();
    this.clearCache();
  }

  /**
   * @internal
   */
  clearCache() {
    this.scriptSnapshots.clear();
    this.fileNames.clear();
    this.projectVersion++;
  }

  /**
   * Close the project, the checker service will be unavailable,
   * and the file cache will be cleared.
   */
  close() {
    this.service.close();
    this.clearCache();
  }
}
