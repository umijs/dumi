export function omitDemoLoader(content: string) {
  expect(content).toContain('"loader": ');
  expect(content).toContain('?type=demo');

  return content.replace(
    /,\n    "loader": [^\n]+,\n    "version": "[^"]+"/g,
    '',
  );
}
