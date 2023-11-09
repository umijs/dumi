import { createHash } from 'crypto';
import * as path from 'typesafe-path/posix';
import type ts from 'typescript/lib/tsserverlibrary';
import { PropertyMetaSchema, SignatureMetaSchema } from './types';

export function createNodeVisitor(
  ts: typeof import('typescript/lib/tsserverlibrary'),
) {
  return function visitNode<T extends ts.Node>(
    node: ts.Node,
    predicate: (node: ts.Node) => boolean,
  ): T | undefined {
    if (predicate(node)) {
      return node as T;
    }
    return ts.forEachChild<T>(node, (cnode: ts.Node) => {
      return visitNode<T>(cnode, predicate);
    });
  };
}

export function getNodeOfSymbol(symbol?: ts.Symbol) {
  if (symbol?.declarations?.length) {
    return symbol.declarations[0];
  }
}

export function getNodeOfType(type: ts.Type) {
  const symbol = type.aliasSymbol ?? type.symbol;
  return getNodeOfSymbol(symbol);
}

export function getJsDocTags(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  typeChecker: ts.TypeChecker,
  prop: ts.Symbol | ts.Signature,
) {
  return prop.getJsDocTags(typeChecker).reduce((doc, tag) => {
    if (!doc[tag.name]) {
      doc[tag.name] = [];
    }
    doc[tag.name].push(
      tag.text !== undefined ? ts.displayPartsToString(tag.text) : '',
    );
    return doc;
  }, {} as Record<string, string[]>);
}

export function reducer(acc: any, cur: any) {
  acc[cur.name] = cur;
  return acc;
}

export function hasQuestionToken(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  prop: ts.Symbol,
) {
  return prop.valueDeclaration
    ? ts.isParameter(prop.valueDeclaration) ||
      ts.isNamedTupleMember(prop.valueDeclaration)
      ? !!prop.valueDeclaration.questionToken
      : false
    : false;
}

export function getTypeOfSignature(
  typeChecker: ts.TypeChecker,
  call: ts.Signature,
) {
  const node = call.getDeclaration();
  return typeChecker.getTypeAtLocation(node);
}

export function isPromiseLike(type: ts.Type) {
  const symbol = type.getSymbol();
  return symbol?.members?.has('then' as ts.__String) || false;
}

export function getSignatureArgsMeta(
  typeChecker: ts.TypeChecker,
  subtype: ts.Type,
  argTypeTransform?: (
    node: ts.NamedTupleMember | ts.ParameterDeclaration,
  ) => PropertyMetaSchema,
) {
  const target = (subtype as ts.TypeReference).target;
  if (!target) return [];
  const labeledElementDeclarations = (target as ts.TupleType)
    .labeledElementDeclarations;
  if (!labeledElementDeclarations) return [];
  const args: SignatureMetaSchema['arguments'] = [];
  labeledElementDeclarations.forEach((node) => {
    if (!node) return;
    args.push({
      key: node.name.getText(),
      required: !node.questionToken,
      type: typeChecker.typeToString(typeChecker.getTypeAtLocation(node)),
      schema: argTypeTransform && argTypeTransform(node),
    });
  });
  return args;
}

export function signatureTypeToString(
  typeChecker: ts.TypeChecker,
  args: ts.TupleType,
  returnType: ts.Type,
) {
  const labeledElementDeclarations = args.labeledElementDeclarations || [];

  const argStringArray = labeledElementDeclarations.reduce((acc, node) => {
    if (!node) return acc;
    const typeString = typeChecker.typeToString(
      typeChecker.getTypeAtLocation(node),
    );
    const questionToken = !!node.questionToken ? '?' : '';
    acc.push(`${node.name.getText()}${questionToken}: ${typeString}`);
    return acc;
  }, [] as string[]);

  return `(${argStringArray.join(',')}) => ${typeChecker.typeToString(
    returnType,
  )}`;
}

export const BasicTypes: Record<string, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  bigint: 'bigint',
  symbol: 'symbol',
  null: 'null',
  undefined: 'undefined',
  void: 'void',
  any: 'any',
  unknown: 'unknown',
  never: 'never',
};

export function createRef(type: string, fileName: string) {
  const hash = createHash('md5');
  hash.update(`${fileName}///${type}`);
  return hash.digest('hex');
}

const windowsPathReg = /\\/g;

export function getPosixPath(anyPath: string) {
  return (anyPath as path.OsPath).replace(
    windowsPathReg,
    '/',
  ) as path.PosixPath;
}
