import path from 'path';
import getRepoUrl from './getRepoUrl';

describe('getRepoUrl', () => {
  it('for github', () => {
    expect(getRepoUrl('git@github.com:umijs/dumi.git')).toEqual('https://github.com/umijs/dumi');
  });

  it('for gitlab (or similar)', () => {
    expect(getRepoUrl('git@some.gitlab.com:umijs/dumi.git')).toEqual(
      'https://some.gitlab.com/umijs/dumi',
    );
  });
});
