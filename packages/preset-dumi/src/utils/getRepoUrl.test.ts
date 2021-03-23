import getRepoUrl from './getRepoUrl';

describe('getRepoUrl', () => {
  it('for github', () => {
    expect(getRepoUrl('git@github.com:umijs/dumi.git')).toEqual('https://github.com/umijs/dumi');
  });

  it('for gitlab (specific manually)', () => {
    expect(getRepoUrl('git@self.gitlab.com:umijs/dumi.git')).toEqual(
      'https://self.gitlab.com/umijs/dumi',
    );

    expect(getRepoUrl('git+https://self.gitlab.com/umijs/subgroup/dumi.git', 'gitlab')).toEqual(
      'https://self.gitlab.com/umijs/subgroup/dumi',
    );

    expect(getRepoUrl('git+http://self.gitlab.com/umijs/subgroup/dumi.git', 'gitlab')).toEqual(
      'http://self.gitlab.com/umijs/subgroup/dumi',
    );
  });

  it('for other hosts', () => {
    expect(getRepoUrl('git@some.other.com:umijs/dumi.git')).toEqual(
      'https://some.other.com/umijs/dumi',
    );
  });

  it('for other protocol', () => {
    expect(getRepoUrl('git@http://self.gitlab.com:umijs/dumi.git')).toEqual(
      'http://self.gitlab.com/umijs/dumi',
    );
  });
});
