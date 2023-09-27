import type * as BabelCore from '@babel/core';
import * as t from '@babel/types';

export function createDynamicImport(importDeclaration: t.ImportDeclaration) {
  const content = importDeclaration.specifiers.map((specifier) => {
    if (t.isImportNamespaceSpecifier(specifier)) {
      return t.identifier(specifier.local.name);
    }
    if (t.isImportDefaultSpecifier(specifier)) {
      return t.objectProperty(
        t.identifier('default'),
        t.identifier(specifier.local.name),
      );
    }
    const keyName = t.isStringLiteral(specifier.imported)
      ? specifier.imported.value
      : specifier.imported.name;
    return t.objectProperty(
      t.identifier(keyName),
      t.identifier(specifier.local.name),
      false,
      keyName === specifier.local.name,
    );
  });
  let id: t.Identifier | t.ObjectPattern;
  if (t.isIdentifier(content[0])) {
    id = content[0];
  } else {
    id = t.objectPattern(content as t.ObjectProperty[]);
  }
  const vd = t.variableDeclarator(
    id,
    t.awaitExpression(t.callExpression(t.import(), [importDeclaration.source])),
  );
  return t.variableDeclaration('const', [vd]);
}

export function createExportObjectProperty(node: t.ExportDeclaration) {
  if (t.isExportAllDeclaration(node) || !node.declaration) return;

  let { declaration } = node;
  if (
    t.isTSDeclareFunction(declaration) ||
    t.isVariableDeclaration(declaration)
  )
    return;

  let name = 'default';
  if (
    t.isClassDeclaration(declaration) ||
    t.isFunctionDeclaration(declaration)
  ) {
    if (declaration.id && t.isExportNamedDeclaration(node)) {
      name = declaration.id.name;
    }
    declaration = t.toExpression(declaration);
  }
  if (!t.isExpression(declaration)) return;
  return t.objectProperty(t.identifier(name), declaration);
}

export function createIIFE(statements: t.Statement[], async: boolean) {
  return t.expressionStatement(
    t.callExpression(
      t.functionExpression(
        null,
        [],
        t.blockStatement(statements),
        false,
        async,
      ),
      [],
    ),
  );
}

export function isModule(path: BabelCore.NodePath<t.Program>) {
  return path.node.sourceType === 'module';
}
