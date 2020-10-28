import fs from 'fs';
import path from 'path';
import { Service } from '@umijs/core';
import { init } from '../../context';
import transformer from '..';

describe('component api example', () => {
  const fixtures = path.join(__dirname, '../fixtures/remark-api');

  beforeAll(() => {
    const service = new Service({
      cwd: path.dirname(fixtures),
    });

    init(service as any, {});
  });

  it('transform api for component md', () => {
    const filePath = path.join(fixtures, 'Hello', 'index.md');
    const result = transformer.markdown(fs.readFileSync(filePath).toString(), filePath).content;

    // compare transform content
    expect(result).toEqual(
      '<div className="markdown"><API exports={["default","World"]} identifier="Hello" /></div>',
    );
  });

  it('transform api when specific src path', () => {
    const filePath = path.join(fixtures, 'custom-src.md');
    const result = transformer.markdown(fs.readFileSync(filePath).toString(), filePath).content;

    // compare transform content
    expect(result).toEqual(
      '<div className="markdown"><API src="./Hello/index.tsx" exports={["default","World"]} identifier="Hello" /></div>',
    );
  });

  it('transform api and show specific exports', () => {
    const filePath = path.join(fixtures, 'custom-exports.md');
    const result = transformer.markdown(fs.readFileSync(filePath).toString(), filePath).content;

    // compare transform content
    expect(result).toEqual(
      '<div className="markdown"><p><API src="./Hello/index.tsx" exports={["default"]} identifier="Hello" /></p></div>',
    );
  });
});
