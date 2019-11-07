import unified from 'unified';
import parse from 'remark-parse';
import rehype from 'remark-rehype';
import stringify from 'rehype-stringify';
import prism from '@mapbox/rehype-prism';
import jsx from './jsx';

const processor = unified()
  .use(parse)
  .use(rehype)
  .use(stringify, { allowDangerousHTML: true })
  .use(prism)
  .use(jsx);

export default (raw: string) => processor.processSync(raw).contents as string;
