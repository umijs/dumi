import fs from 'fs';
import path from 'path';
import { init } from '../../context';
import transformer from '..';
import { Service } from '@umijs/core';
import { winEOL } from '@umijs/utils';

describe('demo example', () => {
  const FILE_PATH = path.join(__dirname, '../fixtures/raw/remark-demo.md');

  beforeAll(async () => {
    const service = new Service({
      cwd: path.dirname(FILE_PATH),
    });

    init(service as any, { resolve: { previewLangs: ['jsx', 'tsx'] } });
  });

  afterAll(() => {
    init(null, null);
  });

  it('transform md to jsx', () => {
    const result = transformer.markdown(fs.readFileSync(FILE_PATH).toString(), FILE_PATH).content;

    // compare transform content
    expect(winEOL(result)).toEqual(
      winEOL(
        fs.readFileSync(path.join(__dirname, '../fixtures/expect/remark-demo.html')).toString(),
      ),
    );
  });
});
