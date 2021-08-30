import fs from 'fs';
import path from 'path';
import transformer from '..';
import { winEOL } from '@umijs/utils';
import { init } from '../../context';
import { Service } from '@umijs/core';
import type { IDumiOpts } from '../../context';

describe('link example', () => {
  const cwd = path.join(__dirname, '../fixtures/remark-link');
  const filePath = path.join(cwd, 'docs', 'remark-link.md');

  beforeAll(() => {
    const service = new Service({
      cwd,
    });
    init(
      service as any,
      {
        locales: [
          ['en-US', 'EN'],
          ['zh-CN', '中文'],
        ],
        resolve: {
          includes: ['docs'],
        },
      } as IDumiOpts,
    );
  });

  it('transform md to jsx', () => {
    const result = transformer.markdown(
      fs.readFileSync(filePath, 'utf8').toString(),
      filePath,
    ).content;
    // compare transform content
    expect(winEOL(result)).toEqual(
      winEOL(fs.readFileSync(path.join(cwd, 'remark-link.html'), 'utf8').toString()),
    );
  });
});
