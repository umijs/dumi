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
    const result = transformer.markdown(fs.readFileSync(filePath, 'utf-8').toString(), filePath).content;

    // compare transform content
    expect(result).toEqual(
      `<div className="markdown"><h2 id="api"><AnchorLink to="#api" aria-hidden="true" tabIndex={-1}><span className={["icon","icon-link"]} /></AnchorLink>API</h2>
<API identifier="Hello" export="default" /><h3 id="api-world"><AnchorLink to="#api-world" aria-hidden="true" tabIndex={-1}><span className={["icon","icon-link"]} /></AnchorLink>World</h3>
<API identifier="Hello" export="World" /></div>`,
    );
  });

  it('transform api when specific src path', () => {
    const filePath = path.join(fixtures, 'custom-src.md');
    const result = transformer.markdown(fs.readFileSync(filePath, 'utf-8').toString(), filePath).content;

    // compare transform content
    expect(result).toEqual(
      `<div className="markdown"><h2 id="api"><AnchorLink to="#api" aria-hidden="true" tabIndex={-1}><span className={["icon","icon-link"]} /></AnchorLink>API</h2>
<API src="./Hello/index.tsx" identifier="Hello" export="default" /><h3 id="api-world"><AnchorLink to="#api-world" aria-hidden="true" tabIndex={-1}><span className={["icon","icon-link"]} /></AnchorLink>World</h3>
<API src="./Hello/index.tsx" identifier="Hello" export="World" /></div>`,
    );
  });

  it('transform api and show specific exports', () => {
    const filePath = path.join(fixtures, 'custom-exports.md');
    const result = transformer.markdown(fs.readFileSync(filePath, 'utf-8').toString(), filePath).content;

    // compare transform content
    expect(result).toEqual(
      `<div className="markdown"><p><h2 id="api"><AnchorLink to="#api" aria-hidden="true" tabIndex={-1}><span className={["icon","icon-link"]} /></AnchorLink>API</h2>
<API src="./Hello/index.tsx" identifier="Hello" export="default" /></p></div>`,
    );
  });

  it('transform api and render correct slugs', () => {
    const filePath = path.join(fixtures, 'api-slugs.md');
    const result = transformer.markdown(fs.readFileSync(filePath, 'utf-8').toString(), filePath);

    // compare transform meta
    expect(result.meta.slugs).toEqual([
      { depth: 2, value: 'First', heading: 'first' },
      { depth: 2, value: 'API', heading: 'api' },
      { depth: 3, value: 'World', heading: 'api-world' },
      { depth: 2, value: 'Second', heading: 'second' },
      { depth: 3, value: 'World', heading: 'api-world' },
    ]);
  });

  it('should guess filename as component name', () => {
    const filePath = path.join(fixtures, 'guess-name.md');
    const result = transformer.markdown(fs.readFileSync(filePath, 'utf-8').toString(), filePath);

    expect(result.content).toContain('identifier="World"');
  });
});
