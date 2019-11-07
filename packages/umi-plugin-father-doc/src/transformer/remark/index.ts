import unified from 'unified';
import stringify from 'rehype-stringify';
import prism from '@mapbox/rehype-prism';
import parse from './parse';
import rehype from './rehype';
import jsx from './jsx';

export default (raw: string, dir: string) => {
  const processor = unified()
    .use(parse)
    .use(rehype, { dir })
    .use(stringify, { allowDangerousHTML: true })
    .use(prism)
    .use(jsx);

  return processor.processSync(raw).contents as string;
};
