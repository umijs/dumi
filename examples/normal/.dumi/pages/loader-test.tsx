import * as demo from '../../docs/index.md?type=demo';
import * as demoIndex from '../../docs/index.md?type=demo-index';
import * as frontmatter from '../../docs/index.md?type=frontmatter';
import * as text from '../../docs/index.md?type=text';

console.log('frontmatter', frontmatter);
console.log('demo', demo);
console.log('demoIndex', demoIndex);
console.log('text', text);

export default () => null;
