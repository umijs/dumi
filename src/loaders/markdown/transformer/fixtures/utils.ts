export function omitDemoLoader(content: string) {
  expect(content).toContain('"loader": () => import(');
  expect(content).toContain('?type=demo');

  return content.replace(
    /,\n    "loader": \(\) => import\('[^']+\\?type=demo[^']*'\),\n    "version": "[^"]+"/g,
    '',
  );
}
