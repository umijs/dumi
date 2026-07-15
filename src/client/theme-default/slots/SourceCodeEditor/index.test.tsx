import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  effects: [] as Array<{
    deps: React.DependencyList | undefined;
    effect: React.EffectCallback;
  }>,
  setCode: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();

  return {
    ...actual,
    useEffect: vi.fn(
      (effect: React.EffectCallback, deps?: React.DependencyList) => {
        mocks.effects.push({ deps, effect });
      },
    ),
    useState: vi.fn((initial: unknown) => [
      initial,
      typeof initial === 'string' ? mocks.setCode : vi.fn(),
    ]),
  };
});

vi.mock('dumi/theme/builtins/SourceCode', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <pre>{children}</pre>
  ),
}));

import SourceCodeEditor from '.';

beforeEach(() => {
  mocks.effects.length = 0;
  mocks.setCode.mockClear();
});

test('synchronizes editor code when initialValue changes', () => {
  renderToStaticMarkup(
    <SourceCodeEditor lang="tsx" initialValue="Primary Button" />,
  );

  const syncEffect = mocks.effects.find(
    ({ deps }) => deps?.length === 1 && deps[0] === 'Primary Button',
  );

  expect(syncEffect).toBeDefined();
  syncEffect!.effect();
  expect(mocks.setCode).toHaveBeenCalledWith('Primary Button');
});
