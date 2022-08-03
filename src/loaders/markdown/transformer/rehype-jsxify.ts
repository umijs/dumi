import type { FrozenProcessor } from 'unified';

let toEstree: typeof import('hast-util-to-estree').toEstree;
let toJs: typeof import('estree-util-to-js').toJs;
let jsx: typeof import('estree-util-to-js').jsx;

// workaround to import pure esm module
(async () => {
  ({ toEstree } = await import('hast-util-to-estree'));
  ({ toJs, jsx } = await import('estree-util-to-js'));
})();

export default function rehypeJsxify(this: FrozenProcessor) {
  this.Compiler = function Compiler(ast) {
    return toJs(toEstree(ast), { handlers: jsx }).value;
  };
}
