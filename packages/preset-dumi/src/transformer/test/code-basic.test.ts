import transformer from '..';

describe('code transformer: basic', () => {
  const normalRaw = '/**\n * title: a\n */\nconst a = 1;';
  const normalExpected = {
    content: 'const a = 1;',
    meta: { title: 'a' },
  };

  it('normal', () => {
    expect(transformer.code(normalRaw)).toEqual(normalExpected);
  });

  it('with head break lines & spaces', () => {
    expect(transformer.code(`\n\n \n  ${normalRaw}`)).toEqual(normalExpected);
  });

  it('with special characters', () => {
    expect(
      transformer.code(`
/**
 * title: '*123*'
 * '*': 1
 * a: |
 *   *a
 */
    `),
    ).toEqual({
      content: '',
      meta: {
        '*': 1,
        a: '*a\n',
        title: '*123*',
      },
    });
  });
});
