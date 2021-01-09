import fs from 'fs';
import path from 'path';
import { Service } from '@umijs/core';
import { winEOL } from '@umijs/utils';
import { IDumiOpts, init } from '../../context';
import transformer from '..';

function clearVersion(source: string) {
  return source.replace(/version":"[^"]+"/g, 'version":"*"');
}

describe('demo example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-demo.md');

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
});
