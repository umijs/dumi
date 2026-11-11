import { getFileContentByRegion } from './utils';

describe('getFileContentByRegion', () => {
  const filePath = '/docs/snippets.md';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each(['<!-- #endregion snippet -->', '<!-- #endregion -->'])(
    'extract a region closed by %s',
    (end) => {
      const content = [
        'before',
        '<!-- #region snippet -->',
        'inside',
        end,
        'after',
      ].join('\n');

      expect(getFileContentByRegion(content, 'snippet', filePath)).toBe(
        'inside',
      );
    },
  );

  test.each(['\n', '\r\n'])(
    'accept marker whitespace and %j line endings',
    (newline) => {
      const content = [
        'before',
        '  <!--#region   some region\t-->  ',
        'first',
        'second',
        '\t<!--  #endregion\t some region--> ',
        'after',
      ].join(newline);

      expect(getFileContentByRegion(content, ' some region ', filePath)).toBe(
        'first\nsecond',
      );
    },
  );

  test('accept the optional hash in VS Code markers', () => {
    const content = '<!-- region snippet -->\ninside\n<!-- endregion -->';

    expect(getFileContentByRegion(content, 'snippet', filePath)).toBe('inside');
  });

  test.each(['snippet', 'nested', ''])(
    'include the entire outer region when a nested region is named %j',
    (name) => {
      const inner = [
        `<!-- #region ${name} -->`,
        'inner',
        '<!-- #endregion -->',
      ].join('\n');
      const selected = `outer before\n${inner}\nouter after`;
      const content = [
        '<!-- #region snippet -->',
        selected,
        '<!-- #endregion snippet -->',
        'outside',
      ].join('\n');

      expect(getFileContentByRegion(content, 'snippet', filePath)).toBe(
        selected,
      );
    },
  );

  test('select an inner region by its exact name', () => {
    const content = [
      '<!-- #region snippets -->',
      'outside',
      '<!-- #region snippet -->',
      'inside',
      '<!-- #endregion snippet -->',
      '<!-- #endregion snippets -->',
    ].join('\n');

    expect(getFileContentByRegion(content, 'snippet', filePath)).toBe('inside');
  });

  test('allow an empty region', () => {
    const content = '<!-- #region snippet -->\n<!-- #endregion -->';

    expect(getFileContentByRegion(content, 'snippet', filePath)).toBe('');
  });

  test.each([
    'no markers',
    '<!-- #region snippets -->\nwrong name\n<!-- #endregion -->',
    '<!-- #region snippet -->\nunterminated',
    '<!-- #endregion snippet -->\n<!-- #region snippet -->\nunterminated',
    '<!-- #region snippet -->\ninside\n<!-- #endregion other -->',
    '<!-- #region snippet -->\n<!-- #region nested -->\ninside\n<!-- #endregion snippet -->',
  ])(
    'log and return the full content for an unmatched region: %s',
    (content) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(getFileContentByRegion(content, 'snippet', filePath)).toBe(
        content,
      );
      expect(error).toHaveBeenCalledOnce();
      expect(error.mock.calls[0].join(' ')).toContain(
        `Region: snippet\nFile: ${filePath}`,
      );
    },
  );
});
