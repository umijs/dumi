import path from 'path';
import slash from 'slash2';
import slugger from 'github-slugger';
import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import ctx from '../../context';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';

const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const sluggerStore = {};

function filterValidChildren(children: IDumiElmNode[]) {
  return children.filter(item => {
    return item.type !== 'element' || !/^[A-Z]/.test(item.tagName);
  });
}

/**
 * get slugger instance for current file
 * @param fileAbsPath   current file absolute path
 * @param masterKey     master file key, use master slugger first to avoid slugs conflict by embed syntax
 */
function getSluggerIns(fileAbsPath: string, masterKey: string) {
  if (masterKey) {
    return sluggerStore[masterKey];
  }

  if (fileAbsPath) {
    const key = getFilePathKey(fileAbsPath);

    if (sluggerStore[key]) {
      sluggerStore[key].reset();
    } else {
      sluggerStore[key] = slugger();
    }

    return sluggerStore[key];
  }

  return slugger();
}

/**
 * get key from file absolute path
 * @param fileAbsPath   file absolute path
 */
export function getFilePathKey(fileAbsPath: string) {
  return slash(path.relative(ctx.umi?.cwd || process.cwd(), fileAbsPath));
}

/**
 * rehype plugin for collect slugs & add id for headings
 */
export default function slug(): IDumiUnifiedTransformer {
  return (ast, vFile) => {
    // initial slugs
    const slugs = getSluggerIns(this.data('fileAbsPath'), this.data('masterKey'));

    vFile.data.slugs = [];

    visit<IDumiElmNode>(ast, 'element', node => {
      // visit all heading element
      if (is(node, headings)) {
        const title = toString({
          children: filterValidChildren(node.children),
          value: node.value,
        });

        // generate id if not exist
        if (!has(node, 'id')) {
          node.properties.id = slugs.slug(title.trim(), false);
        }

        // save slugs
        vFile.data.slugs.push({
          depth: parseInt(node.tagName[1], 10),
          value: title,
          heading: node.properties.id,
        });

        // use first title as page title if not exist
        if (!vFile.data.title) {
          vFile.data.title = title;
        }
      }
    });
  };
}
