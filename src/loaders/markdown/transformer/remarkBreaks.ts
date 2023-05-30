import { IMdTransformerOptions } from '@/loaders/markdown/transformer/index';
import type { Root } from 'mdast';
import type { ReplaceFunction } from 'mdast-util-find-and-replace';

let findAndReplace: typeof import('mdast-util-find-and-replace').findAndReplace;

(async () => {
  ({ findAndReplace } = await import('mdast-util-find-and-replace'));
})();

const warningLock = new Map<string, true>();

function logDeprecationWarning(fileAbsPath: string) {
  if (warningLock.get(fileAbsPath)) return;

  warningLock.set(fileAbsPath, true);

  console.warn(
    'warn - Detected that you are using soft breaks, dumi will transform them into spaces after the declaration',
    'version greater than or equal to `2.2.0`, however, they are still being transformed as line breaks now, please',
    'migrate them to hard breaks before upgrading the declaration version for dumi.\n',
    `  at ${fileAbsPath}\n`,
    '  see also: https://github.com/umijs/dumi/issues/1683\n',
  );
}

export default function remarkBreaks(
  opts: Pick<IMdTransformerOptions, 'fileAbsPath'>,
) {
  const replace: ReplaceFunction = () => {
    logDeprecationWarning(opts.fileAbsPath);
    return { type: 'break' };
  };

  return (tree: Root) => {
    findAndReplace(tree, /\r?\n|\r/g, replace);
  };
}
