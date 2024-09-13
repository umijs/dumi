import { winPath } from '@umijs/utils';
/**
 * loader for mako dumi-raw watch-parent
 */
export default function postRawLoader(this: any, raw: string) {
  return `
  import '${winPath(this.resourcePath)}?watch=parent';
  ${raw};
  `;
}
