import unified from 'unified';
import frontmatter from 'remark-frontmatter';
import stringify from 'rehype-stringify';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import comments from 'rehype-remove-comments';
import prism from '@mapbox/rehype-prism';
import parse from './parse';
import rehype from './rehype';
import yaml from './yaml';
import externalDemo from './externalDemo';
import previewer from './previewer';
import jsx from './jsx';
import isolation from './isolation';

export default (raw: string, fileAbsDir: string) => {
  const processor = unified()
    .use(parse)
    .use(frontmatter)
    .use(yaml)
    .use(externalDemo)
    .use(rehype)
    .use(stringify, { allowDangerousHTML: true, closeSelfClosing: true })
    .use(slug)
    .use(headings)
    .use(comments, { removeConditional: true })
    .use(prism)
    .use(previewer)
    .use(jsx)
    .use(isolation);

  processor.data('fileAbsDir', fileAbsDir);

  return processor.processSync(raw);
};
