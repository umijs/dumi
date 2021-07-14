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
  const ERROR_CODE = `\`\`\`jsx
import fro 'react';
\`\`\``;

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
    const result = transformer.markdown(ERROR_CODE, FILE_PATH, { noCache: true });

    // expect return empty content if demo has error
    expect(result.content).toEqual('');
  });

  it('support to throw error if demo has syntax error', () => {
    expect(
      () => transformer.markdown(ERROR_CODE, FILE_PATH, { noCache: true, throwError: true })
    ).toThrowError();
  });
});
