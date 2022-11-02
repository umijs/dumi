import type { IDumiTechStack } from '@/types';
import {
  transformSync,
  type ExportDefaultDeclaration,
  type ExportDefaultExpression,
  type ModuleDeclaration,
} from '@swc/core';
import Visitor from '@swc/core/Visitor';

/**
 * swc plugin for replace export to return
 */
class ReactDemoVisitor extends Visitor {
  visitExportDefaultDeclaration(
    n: ExportDefaultDeclaration,
  ): ModuleDeclaration {
    return {
      type: 'ReturnStatement',
      span: n.span,
      argument: n.decl,
    } as any;
  }

  visitExportDefaultExpression(n: ExportDefaultExpression): ModuleDeclaration {
    return {
      type: 'ReturnStatement',
      span: n.span,
      argument: n.expression,
    } as any;
  }
}

export default class ReactTechStack implements IDumiTechStack {
  name = 'react';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return ['jsx', 'tsx'].includes(lang);
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    if (opts.type === 'code-block') {
      const isTSX = opts.fileAbsPath.endsWith('.tsx');
      const { code } = transformSync(raw, {
        filename: opts.fileAbsPath,
        jsc: {
          parser: {
            syntax: isTSX ? 'typescript' : 'ecmascript',
            [isTSX ? 'tsx' : 'jsx']: true,
          },
          target: 'es2022',
        },
        module: {
          // all imports to require
          type: 'commonjs',
          // TODO: find a way to remove the useless __esModule flag
          // Object.defineProperty(exports, "__esModule", {
          //   value: true
          // });
          // no 'use strict'
          strictMode: false,
        },
        plugin: (m) => new ReactDemoVisitor().visitProgram(m),
      });

      return `(function () {
${code}
})()`;
    }

    return raw;
  }
}
