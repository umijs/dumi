/**
 * loader for mako dumi-raw watch-parent
 */
export default function postRawLoader(this: any, raw: string) {
  return `
  import '${this.resourcePath}?watch=parent';
  ${raw};
  `;
}
