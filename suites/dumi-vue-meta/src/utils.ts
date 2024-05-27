import { createHash } from 'crypto';
import * as path from 'typesafe-path/posix';
import type ts from 'typescript/lib/tsserverlibrary';
import {
  BlockTagContentTextMeta,
  BlockTagMeta,
  CommentMeta,
  ExternalRefPropertyMetaSchema,
  LocalRefPropertyMetaSchema,
  PropertyMetaSchema,
  RefPropertyMetaSchema,
  SignatureMetaSchema,
  UnknownSymbolResolver,
} from './types';

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

/**
 * Will return the first declaration node among all declarations of the symbol
 */
export function getNodeOfSymbol(symbol?: ts.Symbol) {
  if (symbol?.declarations?.length) {
    return symbol.declarations[0];
  }
}

export function getNodeOfType(type: ts.Type) {
  const symbol = type.aliasSymbol ?? type.symbol;
  return getNodeOfSymbol(symbol);
}

const modiferTags = [
  'public',
  'alpha',
  'beta',
  'experimental',
  'internal',
  'expose',
  'exposed',
  'ignore',
];

export function getComment(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  typeChecker: ts.TypeChecker,
  prop: ts.Symbol | ts.Signature,
) {
  return prop.getJsDocTags(typeChecker).reduce((doc, tag) => {
    if (modiferTags.includes(tag.name)) {
      if (!doc.modifierTags?.length) {
        doc.modifierTags = [];
      }
      doc.modifierTags.push(tag.name);
    } else {
      if (!doc.blockTags?.length) {
        doc.blockTags = [];
      }
      const content: BlockTagContentTextMeta[] = [];
      if (tag.text) {
        content.push({
          kind: 'text',
          text: ts.displayPartsToString(tag.text),
        });
      }
      doc.blockTags.push({ tag: tag.name, content });
    }
    return doc;
  }, {} as CommentMeta);
}

type GetTagResult<T> = T extends 'block' ? BlockTagMeta : string;

export function getTag<T extends 'block' | 'modifer'>(
  comment: CommentMeta,
  tag: string,
  kind?: T,
): GetTagResult<T> | undefined {
  if (kind === 'modifer') {
    return comment.modifierTags?.find((t) => t === tag) as GetTagResult<T>;
  } else if (kind === 'block') {
    return comment.blockTags?.find((t) => t.tag === tag) as GetTagResult<T>;
  } else {
    return (getTag(comment, tag, 'modifer') ??
      getTag(comment, tag, 'block')) as GetTagResult<T>;
  }
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

export function typeParameterToString(
  typeChecker: ts.TypeChecker,
  type: ts.TypeParameter,
  extendType?: ts.Type,
  defaultType?: ts.Type,
) {
  let name = typeChecker.typeToString(type);
  if (extendType) {
    name += ` extend ${typeChecker.typeToString(extendType)}`;
  }
  if (defaultType) {
    name += ` = ${typeChecker.typeToString(defaultType)}`;
  }
  return name;
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

export function isExternalRefSchema(
  schema: RefPropertyMetaSchema,
): schema is ExternalRefPropertyMetaSchema {
  if ((schema as LocalRefPropertyMetaSchema).ref) return false;
  return true;
}

export function createCachedResolver<T extends UnknownSymbolResolver>(
  resolver: T,
) {
  const schemaCache = new WeakMap<
    ts.Declaration,
    Partial<PropertyMetaSchema>
  >();
  return (...args: Parameters<T>) => {
    const targetNode = args[0].targetNode;
    const cache = schemaCache.get(targetNode);
    if (cache) {
      return cache;
    }
    const result = resolver(args[0]);
    schemaCache.set(targetNode, result);
    return result;
  };
}
