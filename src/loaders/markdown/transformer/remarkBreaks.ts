import type { Root } from 'mdast';
import type { ReplaceFunction } from 'mdast-util-find-and-replace';

let findAndReplace: typeof import('mdast-util-find-and-replace').findAndReplace;

(async () => {
  ({ findAndReplace } = await import('mdast-util-find-and-replace'));
})();

const replace: ReplaceFunction = () => {
  // todo: add warn info
  return { type: 'break' };
};

export default function remarkBreaks() {
  return (tree: Root) => {
    findAndReplace(tree, /\r?\n|\r/g, replace);
  };
}
