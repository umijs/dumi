import fs from 'fs';
import path from 'path';
import { Service } from '@umijs/core';
import { winEOL } from '@umijs/utils';
import type { IDumiOpts} from '../../context';
import { init } from '../../context';
import transformer from '..';

function clearVersion(source: string) {
  return source.replace(/version":"[^"]+"/g, 'version":"*"');
}

describe('demo example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-demo.md');
  const ERROR_FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-demo-error.md');
  const ERROR_CODE = fs.readFileSync(ERROR_FILE_PATH, 'utf-8').toString();

  beforeAll(async () => {
    const service = new Service({
      // for test debug demo
      env: 'production',
      cwd: path.dirname(FILE_PATH),
    });

    init(service as any, { resolve: { previewLangs: ['jsx', 'tsx'] } } as IDumiOpts);
  });

  afterAll(() => {
    init(null, null);
  });

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH, 'utf8').toString(), FILE_PATH)
      .content;

    // compare transform content
    expect(clearVersion(winEOL(result))).toEqual(
      clearVersion(
        winEOL(
          fs
            .readFileSync(path.join(__dirname, '../fixtures/expect/remark-demo.html'), 'utf8')
            .toString(),
        ),
      ),
    );
  });

  it('handle error from demo source code', () => {
    const result = transformer.markdown(ERROR_CODE, ERROR_FILE_PATH);

    // expect return empty content if demo has error
    expect(result.content).toEqual('');
  });

  it('support to throw error if demo has syntax error', () => {
    expect(
      () => transformer.markdown(ERROR_CODE, ERROR_FILE_PATH, { throwError: true })
    ).toThrowError();
  });

  it('should avoid demo id conflicts between same name md files', () => {
    const cases = [
      {
        path: path.join(__dirname, '../fixtures/demo-conflicts/a/conflict.md'),
        expects: ['conflict-demo', 'conflict-demo-1'],
      },
      {
        path: path.join(__dirname, '../fixtures/demo-conflicts/b/conflict.md'),
        expects: ['conflict-1-demo', 'conflict-1-demo-1'],
      },
    ];

    cases.forEach((c) => {
      const result = transformer.markdown(fs.readFileSync(c.path, 'utf-8').toString(), c.path);

      c.expects.forEach(e => {
        expect(result.content).toContain(e);
      });
    });
  });
});
