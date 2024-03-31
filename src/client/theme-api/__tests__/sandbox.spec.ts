// @vitest-environment happy-dom
import * as lexer from 'es-module-lexer';
import { rewriteExports } from '../sandbox';

async function getModule(iife: string) {
  const s = iife.indexOf('blob:');
  const e = iife.indexOf("');", s);
  const blob = iife.substring(s, e);
  return await (await fetch(blob)).text();
}

// happy-dom/jsdom cannot test Sandbox because neither of them implements the sandbox and srcdoc attributes of iframe.
// Currently only sandbox is being implemented: https://github.com/capricorn86/happy-dom/pull/1375
// After the srcdoc attribute is implemented, complete tests will be added

describe('esm sandbox', () => {
  describe('rewriteExports', () => {
    beforeAll(async () => {
      await lexer.init;
    });
    it('should assign the local name to the constant', async () => {
      const iife = rewriteExports('m1', 'export default 1;', 'sandbox');
      expect(await getModule(iife)).toMatchInlineSnapshot(`
        "const m1 =  1;
        window.___modules___['m1'] = { 'default': m1 };
        parent.postMessage({ type: 'sandbox.esm.done' }, '*');"
      `);
    });

    it('should remove the local name in the export statement', async () => {
      const iife = rewriteExports(
        'm2',
        'export { xxx as default };',
        'sandbox',
      );
      expect(await getModule(iife)).toMatchInlineSnapshot(`
        "export {  };
        window.___modules___['m2'] = { 'default': xxx };
        parent.postMessage({ type: 'sandbox.esm.done' }, '*');"
      `);
    });
  });
});
