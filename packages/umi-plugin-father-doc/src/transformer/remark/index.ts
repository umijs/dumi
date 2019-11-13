import unified from 'unified';
import stringify from 'rehype-stringify';
import frontmatter from 'remark-frontmatter';
import prism from '@mapbox/rehype-prism';
import parse from './parse';
import rehype from './rehype';
import yaml from './yaml';
import jsx from './jsx';
import isolation from './isolation';

export default (raw: string, dir: string) => {
  const processor = unified()
    .use(parse)
    .use(frontmatter)
    .use(yaml)
    .use(rehype, { dir })
    .use(stringify, { allowDangerousHTML: true })
    .use(prism)
    .use(jsx)
    .use(isolation);

  return processor.processSync(raw);
};
