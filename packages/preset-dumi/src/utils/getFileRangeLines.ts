/**
 * get range lines of markdown file
 */
export default (content: string, range: string) => {
  const [, start, end] = range?.match(/^L(\d+)(?:-L(\d+))?$/) || [];

  if (start) {
    const lineStart = parseInt(start, 10) - 1;
    const lineEnd = end ? parseInt(end, 10) : lineStart + 1;

    content = content
      .split(/\r|\n/g)
      .slice(lineStart, lineEnd)
      .join('\n');
  }

  return content;
};
