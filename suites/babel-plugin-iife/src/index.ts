import type * as BabelCore from '@babel/core';
import * as t from '@babel/types';
import {
  createDynamicImport,
  createExportObjectProperty,
  createIIFE,
  isModule,
} from './utils';

export interface DemoTransformOptions {
  /**
   * Whether to use IIFE module, the default is true
   */
  wrappedByIIFE?: boolean;
  /**
   * It can be set only when wrappedByIIFE is true,
   * which is used to specify the callee function in IIFE as an asynchronous function.
   */
  forceAsync?: boolean;
}

const ASYNC_KEY = 'async';
const EXPORTS_KEY = 'exports';

type PluginType = (
  _: typeof BabelCore,
  opts: DemoTransformOptions,
) => BabelCore.PluginObj;

const iifePlugin: PluginType = (_, opts) => {
  const { wrappedByIIFE = true, forceAsync } = opts;
  return {
    name: 'babel-plugin-iife',
    visitor: {
      Program: {
        enter(path) {
          if (!isModule(path)) return;
          if (wrappedByIIFE) {
            this.set(ASYNC_KEY, forceAsync ?? false);
          }
          this.set(EXPORTS_KEY, []);
        },
        exit(path) {
          if (!isModule(path)) return;

          const exportList = this.get(EXPORTS_KEY);
          if (exportList.length > 0) {
            path.pushContainer(
              'body',
              t.returnStatement(t.objectExpression(exportList)),
            );
          }

          path.replaceWith(
            t.program(
              wrappedByIIFE
                ? [createIIFE(path.node.body, this.get(ASYNC_KEY))]
                : path.node.body,
            ),
          );
        },
      },
      ImportDeclaration: {
        enter() {
          if (!wrappedByIIFE || forceAsync !== undefined) return;
          if (this.get(ASYNC_KEY)) return;
          this.set(ASYNC_KEY, true);
        },
        exit(path) {
          const node = createDynamicImport(path.node);
          path.replaceWith(node);
        },
      },
      ExportDeclaration: {
        exit(path) {
          const prop = createExportObjectProperty(path.node);
          if (prop) {
            this.get(EXPORTS_KEY).push(prop);
          }
          path.remove();
        },
      },
    },
  };
};

export default iifePlugin;
