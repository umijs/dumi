import * as childProcess from 'child_process';
import type { SpawnSyncReturns } from 'node:child_process';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  FuncPropertyMetaSchema,
  LocalRefPropertyMetaSchema,
  Project,
  createProject,
} from '../src/index';
import { entry, rootPath, toRecord, tsconfigPath } from './utils';

vi.mock('node:child_process');

function getSource(project: Project) {
  const { component, types } = project.service.getComponentMeta(entry, 'Foo');
  const props = toRecord(component.props);
  const func = props['func'].schema as FuncPropertyMetaSchema;
  const ref = func.schema?.arguments?.[0]?.schema as LocalRefPropertyMetaSchema;
  return types[ref.ref].source?.[0];
}

function createSpawnSpy(
  map: Record<string, Partial<SpawnSyncReturns<string>>>,
) {
  vi.spyOn(childProcess, 'spawnSync').mockImplementation((_, args) => {
    const result = map[args?.[3] || ''];
    return Object.assign(
      {
        signal: 'SIGURG',
        stdout: '',
        status: 0,
        pid: 0,
        output: [],
        stderr: '',
      },
      result,
    );
  });
}

describe('source config', () => {
  let project!: Project;

  test('disableSources', () => {
    project = createProject({
      tsconfigPath,
      checkerOptions: {
        disableSources: true,
      },
    });
    const source = getSource(project);
    expect(source?.url).toBe(undefined);
  });
  test('disableGit', () => {
    expect(() =>
      createProject({
        tsconfigPath,
        checkerOptions: {
          disableGit: true,
        },
      }),
    ).toThrowError(
      /Please set `sourceLinkTemplate` to produce source links or just set `disableSources`/,
    );
  });
  test('set disableGit, but gitRevision is not provided', () => {
    expect(() =>
      createProject({
        tsconfigPath,
        checkerOptions: {
          disableGit: true,
          sourceLinkTemplate:
            'https://github.com/umijs/dumi/{gitRevision}/{path}#L{line}',
        },
      }),
    ).toThrowError(/you must set `gitRevision`/);
  });
  test('disableGit/gitRevision is provided', () => {
    project = createProject({
      rootPath,
      tsconfigPath,
      checkerOptions: {
        disableGit: true,
        gitRevision: 'tree/master',
        sourceLinkTemplate:
          'https://github.com/umijs/dumi/{gitRevision}/{path}#L{line}',
      },
    });
    const source = getSource(project);
    expect(source?.url).toMatchInlineSnapshot(
      '"https://github.com/umijs/dumi/tree/master/suites/dumi-vue-meta/tests/fixtures/props.ts#L16"',
    );
  });

  test('git remote: bad remote', () => {
    createSpawnSpy({
      '--show-toplevel': { stdout: rootPath },
      '--short': { stdout: '31231242' },
      'get-url': { status: 1 },
    });
    const warn = vi.spyOn(console, 'warn');
    project = createProject({
      rootPath,
      tsconfigPath,
      checkerOptions: {
        gitRemote: 'bad remote',
      },
    });
    const source = getSource(project);
    expect(source?.url).toBe(undefined);
    expect(warn).toHaveBeenCalled();
  });

  test('git remote: ssh format', () => {
    createSpawnSpy({
      '--show-toplevel': { stdout: rootPath },
      '--short': { stdout: '31231242' },
      'get-url': { stdout: 'git@gitee.com:umijs/dumi.git' },
    });
    project = createProject({
      rootPath,
      tsconfigPath,
      checkerOptions: {
        gitRemote: 'upstream',
      },
    });
    const source = getSource(project);
    expect(source?.url).toMatchInlineSnapshot(
      '"https://gitee.com/umijs/dumi/blob/31231242/suites/dumi-vue-meta/tests/fixtures/props.ts#L16"',
    );
  });

  test('git remote: unknown repo', () => {
    createSpawnSpy({
      '--show-toplevel': { stdout: rootPath },
      '--short': { stdout: '31231242' },
      'get-url': { stdout: 'https://e.coding.net/xxx/xxxx/xxxx.git' },
    });
    const warn = vi.spyOn(console, 'warn');
    project = createProject({
      rootPath,
      tsconfigPath,
      checkerOptions: {},
    });
    const source = getSource(project);
    expect(source?.url).toBe(undefined);
    expect(warn).toHaveBeenCalled();
  });

  test('git remote: config sourceLinkTemplate when Git Repo URL cannot be parsed', () => {
    createSpawnSpy({
      '--show-toplevel': { stdout: rootPath },
      '--short': { stdout: '31231242' },
      'get-url': { stdout: 'https://e.coding.net/xxx/xxxx/xxxx.git' },
    });
    project = createProject({
      rootPath,
      tsconfigPath,
      checkerOptions: {
        sourceLinkTemplate:
          'https://xxx.coding.net/p/xxxx/d/xxxx/git/tree/{gitRevision}/{path}#L{line}',
      },
    });
    const source = getSource(project);
    expect(source?.url).toMatchInlineSnapshot(
      '"https://xxx.coding.net/p/xxxx/d/xxxx/git/tree/31231242/suites/dumi-vue-meta/tests/fixtures/props.ts#L16"',
    );
  });

  test('git revision: no output', () => {
    createSpawnSpy({
      '--show-toplevel': { stdout: rootPath },
      '--short': { stdout: '' },
      'get-url': { stdout: 'https://e.coding.net/xxx/xxxx/xxxx.git' },
    });
    const warn = vi.spyOn(console, 'warn');
    project = createProject({
      rootPath,
      tsconfigPath,
      checkerOptions: {},
    });
    const source = getSource(project);
    expect(source?.url).toBe(undefined);
    expect(warn).toHaveBeenCalled();
  });

  afterEach(() => {
    project && project.close();
    vi.restoreAllMocks();
  });
});
