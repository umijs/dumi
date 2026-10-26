import path from 'path';
import { applyBabelPlugins, wrapDemoWithFn } from './utils';

const EMOTION_PLUGIN = require.resolve('@emotion/babel-plugin');
const EMOTION_DEMO = `import React from 'react';
import styled from '@emotion/styled';

const InlineCard = styled.div({ color: 'blue' });

export default () => <InlineCard data-testid="inline">inline</InlineCard>;
`;

describe('wrapDemoWithFn', () => {
  test('rewrite static imports to dynamic imports', () => {
    const code = wrapDemoWithFn(EMOTION_DEMO, {
      filename: path.join(__dirname, 'demo.tsx'),
      parserConfig: { syntax: 'typescript', tsx: true },
    });

    expect(code).toMatch(/^async function\(\)/);
    expect(code).toContain(`await import('@emotion/styled')`);
    expect(code).not.toContain('import styled from');
    // without emotion plugin, no label will be generated
    expect(code).not.toContain('label');
  });

  test('apply import-sensitive babel plugins before wrapping', () => {
    const code = wrapDemoWithFn(EMOTION_DEMO, {
      filename: path.join(__dirname, 'demo.tsx'),
      parserConfig: { syntax: 'typescript', tsx: true },
      babelPlugins: [[EMOTION_PLUGIN, { autoLabel: 'always' }]],
    });

    // emotion plugin should see the original static import and inject label
    expect(code).toMatch(/label:\s*['"]InlineCard['"]/);
    // and the result should still be wrapped
    expect(code).toMatch(/^async function\(\)/);
    expect(code).toContain('await import(');
    expect(code).not.toMatch(/^\s*import /m);
  });
});

describe('applyBabelPlugins', () => {
  test('keep typescript & jsx syntax for swc', () => {
    const code = applyBabelPlugins(
      `import styled from '@emotion/styled';
interface IProps { active: boolean }
const Card = styled.div({ color: 'red' });
export default (props: IProps) => <Card data-active={props.active} />;`,
      {
        filename: path.join(__dirname, 'demo.tsx'),
        parserConfig: { syntax: 'typescript', tsx: true },
        plugins: [[EMOTION_PLUGIN, { autoLabel: 'always' }]],
      },
    );

    // typescript & jsx syntax should be kept as-is
    expect(code).toContain('interface IProps');
    expect(code).toContain('props: IProps');
    expect(code).toContain('<Card data-active={props.active} />');
    expect(code).toMatch(/label:\s*['"]Card['"]/);
  });

  test('support jsx demo', () => {
    const code = applyBabelPlugins(
      `import styled from '@emotion/styled';
const Card = styled.div({ color: 'red' });
export default () => <Card />;`,
      {
        filename: path.join(__dirname, 'demo.jsx'),
        parserConfig: { syntax: 'ecmascript', jsx: true },
        plugins: [[EMOTION_PLUGIN, { autoLabel: 'always' }]],
      },
    );

    expect(code).toMatch(/label:\s*['"]Card['"]/);
    expect(code).toContain('<Card />');
  });

  test('return original code when no plugin', () => {
    expect(
      applyBabelPlugins('const a = 1;', {
        filename: 'a.tsx',
        parserConfig: { syntax: 'typescript', tsx: true },
        plugins: [],
      }),
    ).toBe('const a = 1;');
  });
});
