import type { IDumiTechStack } from '@/types';
import {
  transformSync,
  type ExportDefaultDeclaration,
  type ExportDefaultExpression,
  type Expression,
  type ImportDeclaration,
  type ObjectPattern,
  type ReturnStatement,
  type Span,
  type VariableDeclaration,
} from '@swc/core';
import Visitor from '@swc/core/Visitor';

function createReturnStmt(exp: Expression, span: Span): ReturnStatement {
  return {
    type: 'ReturnStatement',
    span,
    argument: {
      type: 'ObjectExpression',
      span,
      properties: [
        {
          type: 'KeyValueProperty',
          key: {
            type: 'Identifier',
            span,
            value: 'default',
            optional: false,
          },
          value: exp,
        },
      ],
    },
  };
}

/**
 * swc plugin for replace export to return, and replace import to await import
 */
class ReactDemoVisitor extends Visitor {
  // @ts-ignore
  visitImportDeclaration(
    n: ImportDeclaration,
  ): ImportDeclaration | VariableDeclaration {
    if (!n.typeOnly) {
      const namespaceImport = n.specifiers.find(
        (s) => s.type === 'ImportNamespaceSpecifier',
      );
      const id = namespaceImport
        ? namespaceImport.local
        : ({
            type: 'ObjectPattern',
            span: n.span,
            properties: n.specifiers.map((s) => {
              if (
                s.type === 'ImportDefaultSpecifier' ||
                (s.type === 'ImportSpecifier' &&
                  s.imported?.type === 'Identifier')
              ) {
                return {
                  type: 'KeyValuePatternProperty',
                  span: s.span,
                  key:
                    s.type === 'ImportSpecifier'
                      ? s.imported!
                      : {
                          type: 'Identifier',
                          span: s.span,
                          value: 'default',
                          optional: false,
                        },
                  value: s.local,
                };
              }

              return {
                type: 'AssignmentPatternProperty',
                span: s.span,
                key: s.local,
              };
            }),
            optional: false,
          } as ObjectPattern);

      return {
        type: 'VariableDeclaration',
        kind: 'const',
        declare: false,
        span: n.span,
        declarations: [
          {
            type: 'VariableDeclarator',
            span: n.span,
            definite: false,
            id,
            init: {
              span: n.span,
              type: 'AwaitExpression',
              argument: {
                type: 'CallExpression',
                span: n.span,
                callee: {
                  type: 'Import',
                  span: n.span,
                },
                arguments: [{ expression: n.source }],
              },
            },
          },
        ],
      };
    }

    return n;
  }

  // @ts-ignore
  visitExportDefaultDeclaration(
    n: ExportDefaultDeclaration,
  ): ExportDefaultDeclaration | ReturnStatement {
    if (n.decl.type !== 'TsInterfaceDeclaration') {
      return createReturnStmt(n.decl, n.span);
    }

    return n;
  }

  // @ts-ignore
  visitExportDefaultExpression(n: ExportDefaultExpression): ReturnStatement {
    return createReturnStmt(n.expression, n.span);
  }

  visitTsType(n: any) {
    // to avoid `Error: Method visitTsType not implemented.`
    // ref: https://github.com/swc-project/swc/blob/31630ba913fffa68fc4703cf6497d09f2e6ba2e9/node-swc/src/Visitor.ts#L1680
    return n;
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
          type: 'es6',
        },
        plugin: (m) => new ReactDemoVisitor().visitProgram(m),
      });

      return `React.lazy(async () => {
${code}
})`;
    }

    return raw;
  }
}
