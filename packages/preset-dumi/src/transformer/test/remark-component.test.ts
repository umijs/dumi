import fs from 'fs';
import path from 'path';
import { Service } from '@umijs/core';
import ctx, { init } from '../../context';
import transformer from '..';
import type { IDumiOpts } from '../..';
import { registerMdComponent } from '../remark/component';

describe('markdown component', () => {
  const fixtures = path.join(__dirname, '../fixtures/remark-component');

  beforeAll(() => {
    const service = new Service({
      cwd: path.dirname(fixtures),
    });
    init(service as any, {} as IDumiOpts);
    ctx.umi.config = {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/remark-component'),
      },
    };
    registerMdComponent({
      name: 'DumiApi',
      component: path.join(fixtures, 'DumiApi.tsx'),
      compiler: () => {},
    });
  });

  it('transform markdown component', () => {
    const filePath = path.join(fixtures, 'DumiApi.md');
    const result = transformer.markdown(
      fs.readFileSync(filePath, 'utf8').toString(),
      filePath,
    ).content;
    expect(result).toEqual('<div className="markdown"><DumiApi /></div>');
  });
});
