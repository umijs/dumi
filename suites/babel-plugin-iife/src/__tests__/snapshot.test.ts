import { describe, expect, test } from 'vitest';
import { transpile } from './utils';

describe('babel-plugin-iife', () => {
  [
    {
      name: 'should wrapped by iife',
      from: 'const a = 1;',
    },
    {
      name: 'static import -> dynamic import',
      from: `
        import a from 'a';
        import { b } from 'b';
        import { c1 as c } from 'c';
        import * as d from 'd';
        import e, { e1, e2 as e3 } from 'e';
        import { createVNode as _createVNode, createTextVNode as _createTextVNode } from "vue";
      `,
    },
    {
      name: 'export default `value`',
      from: 'export default a;',
    },
    {
      name: 'export default `class`',
      from: 'export default class A {};',
    },
    {
      name: 'export default `function`',
      from: 'export default () => null;',
    },
    {
      name: 'export named',
      from: `
        const name1 = 1, name2 = 2;
        export { name1, name2 };
        export let name3 = 1;
        export function x () {};
        export class A {};
      `,
    },
  ].forEach(({ name, from }) => {
    test(name, async () => {
      expect(await transpile(from)).toMatchSnapshot();
    });
  });
});
