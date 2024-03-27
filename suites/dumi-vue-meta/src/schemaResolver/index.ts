import * as path from 'typesafe-path/posix';
import type ts from 'typescript/lib/tsserverlibrary';
import type { Repo } from '../checker';
import { VueLanguageService } from '../checker';
import {
  EventMeta,
  ExposeMeta,
  FuncPropertyMetaSchema,
  MetaCheckerOptions,
  PropertyMeta,
  PropertyMetaKind,
  PropertyMetaSchema,
  PropertySchemaResolver,
  PropertySourceReference,
  TypeParamPropertyMetaSchema,
  UnknownSymbolResolver,
} from '../types';
import {
  BasicTypes,
  createCachedResolver,
  createRef,
  getComment,
  getNodeOfSymbol,
  getNodeOfType,
  getSignatureArgsMeta,
  getTypeOfSignature,
  hasQuestionToken,
  isPromiseLike,
  reducer,
  signatureTypeToString,
  typeParameterToString,
} from '../utils';
import {
  externalSymbolResolver as esResolver,
  vueOptionSchemaResolver,
} from './custom';

const externalSymbolResolver = createCachedResolver(esResolver);

export class SchemaResolver {
  private schemaCache = new WeakMap<ts.Type, PropertyMetaSchema>();
  private schemaOptions!: NonNullable<MetaCheckerOptions>;

  /**
   * Used to store all declared interfaces or types
   */
  private readonly types: Record<string, PropertyMetaSchema> = {};
  private readonly typeCache = new WeakMap<ts.Type, string>();

  constructor(
    private ts: typeof import('typescript/lib/tsserverlibrary'),
    private typeChecker: ts.TypeChecker,
    private langService: VueLanguageService,
    private symbolNode: ts.Expression,
    private repo: Repo,
    options: MetaCheckerOptions,
  ) {
    this.schemaOptions = Object.assign(
      {
        exclude: /node_modules/,
        ignoreTypeArgs: false,
        disableExternalLinkAutoDectect: false,
      },
      options,
    );
  }

  /**
   * resolve types ahead of time
   */
  public preResolve(types: ts.Type[]) {
    types.forEach((type) => {
      this.resolveSchema(type);
    });
  }

  private setType(
    type: string,
    fileName: string,
    subtype: ts.Type,
    schema: PropertyMetaSchema,
  ) {
    const key = createRef(type, fileName);
    this.types[key] = schema;
    this.typeCache.set(subtype, key);
    return key;
  }

  public getSchemaByRef(ref: string) {
    return this.types[ref];
  }

  public getRefByType(type: ts.Type) {
    return this.typeCache.get(type);
  }

  public getSchemaByType(type: ts.Type) {
    const ref = this.getRefByType(type);
    if (ref) {
      return this.getSchemaByRef(ref);
    }
  }

  public getTypes() {
    return this.types;
  }

  private shouldIgnore(subtype: ts.Type) {
    const name = this.typeChecker.typeToString(subtype);
    const schemaOptions = this.schemaOptions;

    if (!schemaOptions) return false;
    let node: ts.Declaration | undefined;
    if (schemaOptions.exclude && (node = getNodeOfType(subtype))) {
      const excludePaths =
        schemaOptions.exclude instanceof Array
          ? schemaOptions.exclude
          : [schemaOptions.exclude];
      for (const pathPattern of excludePaths) {
        const fileName = node.getSourceFile().fileName;
        if (typeof pathPattern === 'string') {
          return fileName === pathPattern;
        } else if (pathPattern instanceof RegExp) {
          return pathPattern.test(fileName);
        } else if (pathPattern instanceof Function) {
          return pathPattern(fileName);
        }
      }
    }

    for (const item of schemaOptions.ignore ?? []) {
      if (typeof item === 'function') {
        const result = item(name, subtype, this.typeChecker);
        if (typeof result === 'boolean') return result;
      } else if (name === item) {
        return true;
      }
    }

    return false;
  }

  public createTypeParamMetaSchema(param: ts.TypeParameter) {
    const { typeChecker } = this;
    const extendType = param.getConstraint();
    const defaultType = param.getDefault();
    const schema: TypeParamPropertyMetaSchema = {
      kind: PropertyMetaKind.TYPE_PARAM,
      name: typeChecker.typeToString(param),
      type: typeParameterToString(typeChecker, param, extendType, defaultType),
    };
    if (extendType || defaultType) {
      schema.schema = {};
      if (extendType) {
        schema.schema.type = this.resolveSchema(extendType);
      }
      if (defaultType) {
        schema.schema.default = this.resolveSchema(defaultType);
      }
    }
    return schema;
  }

  public createSignatureMetaSchema(call: ts.Signature, subtype?: ts.Type) {
    const { typeChecker, ts } = this;
    const returnType = call.getReturnType();
    const typeParams = call.getTypeParameters();
    const schema: FuncPropertyMetaSchema = {
      kind: PropertyMetaKind.FUNC,
      type: typeChecker.typeToString(
        subtype || getTypeOfSignature(typeChecker, call),
      ),
      schema: {
        isAsync: isPromiseLike(returnType),
        returnType: this.resolveSchema(returnType),
        arguments: call.parameters.map((param) => {
          const argType = typeChecker.getTypeAtLocation(
            getNodeOfSymbol(param) as ts.Node,
          );
          return {
            key: param.name,
            type: typeChecker.typeToString(argType),
            schema: this.resolveSchema(argType),
            required: !hasQuestionToken(ts, param),
          };
        }),
      },
    };
    if (typeParams) {
      schema.schema!.typeParams = typeParams.map((typeParam) =>
        this.resolveSchema(typeParam),
      );
    }
    return schema;
  }

  private resolveExactSchema(subtype: ts.Type): PropertyMetaSchema {
    const { typeChecker, ts, resolveSchema } = this;

    const type = typeChecker.typeToString(subtype);

    if (BasicTypes[type]) {
      return {
        kind: PropertyMetaKind.BASIC,
        type,
      };
    } else if (subtype.isLiteral()) {
      const primitiveType = typeChecker.getBaseTypeOfLiteralType(subtype);
      return {
        kind: PropertyMetaKind.LITERAL,
        type: typeChecker.typeToString(primitiveType),
        value: type,
      };
    } else if (subtype.isUnion()) {
      return {
        kind: PropertyMetaKind.ENUM,
        type,
        schema: subtype.types.map(resolveSchema.bind(this)),
      };
    }

    // @ts-ignore - typescript internal, isArrayLikeType exists
    else if (typeChecker.isArrayLikeType(subtype)) {
      return {
        kind: PropertyMetaKind.ARRAY,
        type,
        schema: typeChecker
          .getTypeArguments(subtype as ts.TypeReference)
          .map(resolveSchema.bind(this)),
      };
    } else if (
      subtype.getCallSignatures().length === 0 &&
      (subtype.isClassOrInterface() ||
        subtype.isIntersection() ||
        (subtype as ts.ObjectType).objectFlags & ts.ObjectFlags.Anonymous)
    ) {
      return {
        kind: PropertyMetaKind.OBJECT,
        type,
        schema: subtype
          .getProperties()
          .map((prop) => this.resolveNestedProperties(prop, true))
          .reduce(reducer, {}),
      };
    } else if (subtype.getCallSignatures().length >= 1) {
      // There may be multiple signatures, but we only take the first one
      const signature = subtype.getCallSignatures()[0];
      return this.createSignatureMetaSchema(signature);
    } else if (subtype.isTypeParameter()) {
      return this.createTypeParamMetaSchema(subtype);
    }

    return {
      kind: PropertyMetaKind.UNKNOWN,
      type,
    };
  }

  private getNodeAndSymbolOfUnknownType(subtype: ts.Type) {
    const targetSymbol = subtype.getSymbol() || subtype.aliasSymbol;
    if (!targetSymbol) return null;
    const targetNode = getNodeOfSymbol(targetSymbol);
    if (!targetNode) return null;
    return { targetNode, targetSymbol };
  }

  private resolveUnknownSchema(subtype: ts.Type): PropertyMetaSchema {
    const { typeChecker, resolveSchema, schemaOptions, ts } = this;
    const type = typeChecker.typeToString(subtype);
    const schema: any = {
      kind: PropertyMetaKind.UNKNOWN,
      type,
    };
    const typeInfo = this.getNodeAndSymbolOfUnknownType(subtype);
    if (typeInfo) {
      const options = {
        ts,
        typeChecker,
        schemaOptions,
        ...typeInfo,
      };
      const { unknownSymbolResolvers = [] } = schemaOptions;
      const resolvers: UnknownSymbolResolver<PropertyMetaSchema>[] = [
        externalSymbolResolver,
        ...unknownSymbolResolvers,
      ];
      resolvers.reduce((targetSchema, resolver) => {
        const partialSchema = resolver(options);
        Object.assign(targetSchema, partialSchema);
        if (partialSchema.kind === PropertyMetaKind.REF) {
          delete targetSchema.type;
        }
        return targetSchema;
      }, schema);
    }

    if (!schemaOptions?.ignoreTypeArgs) {
      // Obtaining type parameters
      // Although some types do not need to be check themselves,
      // their type parameters still need to be checked.
      let typeArgs = typeChecker.getTypeArguments(subtype as ts.TypeReference);
      if (typeArgs.length) {
        if (typeChecker.isArrayLikeType(subtype)) {
          schema.kind = PropertyMetaKind.ARRAY;
          schema.schema = typeArgs.map(resolveSchema.bind(this));
        } else {
          schema.typeParams = typeArgs.map(resolveSchema.bind(this));
        }
      }
    }

    if (BasicTypes[type] && schema.kind === PropertyMetaKind.UNKNOWN) {
      return {
        kind: PropertyMetaKind.BASIC,
        type,
      };
    }
    return schema;
  }

  private getSource(
    node:
      | ts.TypeAliasDeclaration
      | ts.TypeOnlyAliasDeclaration
      | ts.InterfaceDeclaration
      | ts.TypeParameterDeclaration,
  ): PropertySourceReference {
    const { ts, langService } = this;
    const sourceFile = node.getSourceFile();
    const { line, character } = ts.getLineAndCharacterOfPosition(
      sourceFile,
      node.getStart(),
    );
    const fullFileName = sourceFile.fileName;
    const fileName = path.relative(
      langService.host.rootPath as path.PosixPath,
      fullFileName as path.PosixPath,
    );
    const line1Based = line + 1;
    return {
      fileName,
      line: line1Based,
      character,
      url: this.repo?.getURL(fullFileName, line1Based),
    };
  }

  public resolveSchema(subtype: ts.Type): PropertyMetaSchema {
    const ref = this.getRefByType(subtype);
    if (ref) return { ref, kind: PropertyMetaKind.REF };

    const cachedSchema = this.schemaCache.get(subtype);
    if (cachedSchema) {
      return cachedSchema;
    }

    const { ts, typeChecker } = this;
    const type = typeChecker.typeToString(subtype);
    const node = getNodeOfType(subtype);

    let schema: PropertyMetaSchema;

    if (this.shouldIgnore(subtype)) {
      schema = this.resolveUnknownSchema(subtype);
    } else {
      schema = this.resolveExactSchema(subtype);
      // Remove basic types and unknown types
      if (
        node &&
        !BasicTypes[type] &&
        schema.kind !== PropertyMetaKind.UNKNOWN &&
        (ts.isTypeOnlyImportOrExportDeclaration(node) ||
          ts.isTypeAliasDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isTypeParameterDeclaration(node))
      ) {
        const source = this.getSource(node);
        Object.assign(schema, { source: [source] });
        const ref = this.setType(type, source.fileName, subtype, schema);
        return { ref, kind: PropertyMetaKind.REF };
      }
    }

    this.schemaCache.set(subtype, schema);

    return schema;
  }

  // `normal` means whether it is a normal prop. If it is false, it is a prop of the vue instance.
  public resolveNestedProperties(prop: ts.Symbol, normal = false) {
    const { ts, typeChecker, symbolNode } = this;
    const schemaOptions = this.schemaOptions!;
    const subtype = typeChecker.getTypeOfSymbolAtLocation(prop, symbolNode!);

    const originalMeta = {
      name: prop.getEscapedName().toString(),
      description: ts.displayPartsToString(
        prop.getDocumentationComment(typeChecker),
      ),
      required: !(prop.flags & ts.SymbolFlags.Optional),
      comment: getComment(ts, typeChecker, prop),
      type: typeChecker.typeToString(subtype),
    } as Partial<PropertyMeta>;

    if (normal) {
      originalMeta.schema = this.resolveSchema(subtype);
      return originalMeta as PropertyMeta;
    }

    const { propertyResovlers } = schemaOptions;

    const resolvers: PropertySchemaResolver<PropertyMeta>[] = [
      vueOptionSchemaResolver,
    ];

    if (propertyResovlers?.length) {
      resolvers.push(...propertyResovlers);
    }

    originalMeta.global = false;

    const targetNode = getNodeOfSymbol(prop);
    let targetType: ts.Type | undefined;

    if (targetNode && ts.isPropertyAssignment(targetNode)) {
      targetType = typeChecker.getTypeAtLocation(targetNode.initializer);
    } else if (targetNode && ts.isShorthandPropertyAssignment(targetNode)) {
      targetType = typeChecker.getTypeAtLocation(targetNode);
    }

    const options = {
      ts,
      typeChecker,
      schemaOptions,
      prop,
      symbolNode,
      targetNode,
      targetType,
    };

    const meta = resolvers.reduce((originMeta, resolver) => {
      return resolver(originMeta, options);
    }, originalMeta);

    meta.schema = this.resolveSchema(subtype);
    return meta as PropertyMeta;
  }

  public resolveSlotProperties(prop: ts.Symbol) {
    const { typeChecker, symbolNode, ts } = this;
    const propType = typeChecker.getNonNullableType(
      typeChecker.getTypeOfSymbolAtLocation(prop, symbolNode!),
    );
    const signatures = propType.getCallSignatures();
    const paramType = signatures?.at(0)?.parameters?.at(0);
    let subtype = paramType
      ? typeChecker.getTypeOfSymbolAtLocation(paramType, symbolNode!)
      : propType;

    subtype = subtype.getNumberIndexType() ?? subtype;

    return {
      name: prop.getName(),
      type: typeChecker.typeToString(subtype),
      comment: getComment(ts, typeChecker, prop),
      description: ts.displayPartsToString(
        prop.getDocumentationComment(typeChecker),
      ),
      schema: this.resolveSchema(subtype),
    };
  }

  public resolveEventSignature(call: ts.Signature): EventMeta {
    const { symbolNode, typeChecker, ts } = this;
    const subtype = typeChecker.getTypeOfSymbolAtLocation(
      call.parameters[1],
      symbolNode!,
    );
    const returnType = call.getReturnType();
    const typeString = signatureTypeToString(
      typeChecker,
      (subtype as ts.TypeReference).target as ts.TupleType,
      returnType,
    );

    return {
      name: (
        typeChecker.getTypeOfSymbolAtLocation(
          call.parameters[0],
          symbolNode!,
        ) as ts.StringLiteralType
      ).value,
      type: typeString,
      comment: getComment(ts, typeChecker, call),
      schema: {
        kind: PropertyMetaKind.FUNC,
        type: typeString,
        schema: {
          isAsync: isPromiseLike(returnType),
          returnType: this.resolveSchema(returnType),
          arguments: getSignatureArgsMeta(typeChecker, subtype, (node) =>
            this.resolveSchema(typeChecker.getTypeAtLocation(node)),
          ),
        },
      },
    };
  }

  public resolveExposedProperties(expose: ts.Symbol): ExposeMeta {
    const { symbolNode, typeChecker, ts } = this;
    const subtype = typeChecker.getTypeOfSymbolAtLocation(expose, symbolNode!);
    return {
      name: expose.getName(),
      type: typeChecker.typeToString(subtype),
      comment: getComment(ts, typeChecker, expose),
      description: ts.displayPartsToString(
        expose.getDocumentationComment(typeChecker),
      ),
      schema: this.resolveSchema(subtype),
    };
  }
}
