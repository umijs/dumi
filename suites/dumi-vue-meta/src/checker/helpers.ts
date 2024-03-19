import type { VueCompilerOptions, VueFile } from '@vue/language-core';
import { parseScriptSetupRanges } from '@vue/language-core';
import type ts from 'typescript/lib/tsserverlibrary';
import { code as typeHelpersCode } from 'vue-component-type-helpers';
import { getNodeOfSymbol } from '../utils';

export function isMetaFileName(fileName: string) {
  return fileName.endsWith('.meta.ts');
}

export function getMetaFileName(fileName: string) {
  return (
    (fileName.endsWith('.vue')
      ? fileName
      : fileName.substring(0, fileName.lastIndexOf('.'))) + '.meta.ts'
  );
}

export function getMetaScriptContent(fileName: string, target: number) {
  const from = fileName.substring(0, fileName.length - '.meta.ts'.length);
  let code = `
import * as Components from '${from}';
export default {} as { [K in keyof typeof Components]: ComponentMeta<typeof Components[K]>; };

export type * from '${from}';

interface ComponentMeta<T> {
  type: ComponentType<T>;
  props: ComponentProps<T>;
  emit: ComponentEmit<T>;
  slots: ${target < 3 ? 'Vue2ComponentSlots' : 'ComponentSlots'}<T>;
  exposed: ComponentExposed<T>;
};

${typeHelpersCode}
`.trim();
  return code;
}

export function getExports(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  program: ts.Program,
  typeChecker: ts.TypeChecker,
  componentPath: string,
  exportedType: boolean = false,
) {
  const sourceFile = program?.getSourceFile(getMetaFileName(componentPath));
  if (!sourceFile) {
    throw `Could not find main source file of ${componentPath}`;
  }

  const moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw `Could not find module symbol of ${componentPath}`;
  }

  const exportedSymbols = typeChecker.getExportsOfModule(moduleSymbol);

  let symbolNode: ts.Expression | undefined;
  let exportedTypes: ts.Type[] = [];

  for (const symbol of exportedSymbols) {
    const [declaration] = symbol.getDeclarations() ?? [];

    if (ts.isExportAssignment(declaration)) {
      symbolNode = declaration.expression;
    }

    if (
      exportedType &&
      (ts.isTypeOnlyImportOrExportDeclaration(declaration) ||
        ts.isTypeAliasDeclaration(declaration) ||
        ts.isInterfaceDeclaration(declaration))
    ) {
      const type = typeChecker.getDeclaredTypeOfSymbol(symbol);
      exportedTypes.push(type);
    }
  }

  if (!symbolNode) {
    throw 'Could not find symbol node';
  }

  const exportDefaultType = typeChecker.getTypeAtLocation(symbolNode);
  const exports = exportDefaultType.getProperties();

  return {
    symbolNode,
    exports,
    exportedTypes,
  };
}

export function resolveDefaultOptionExpression(
  _default: ts.Expression,
  ts: typeof import('typescript/lib/tsserverlibrary'),
) {
  if (ts.isArrowFunction(_default)) {
    if (ts.isBlock(_default.body)) {
      return _default; // TODO
    } else if (ts.isParenthesizedExpression(_default.body)) {
      return _default.body.expression;
    } else {
      return _default.body;
    }
  }
  return _default;
}

export function resolvePropsOption(
  ast: ts.SourceFile,
  props: ts.ObjectLiteralExpression,
  printer: ts.Printer | undefined,
  ts: typeof import('typescript/lib/tsserverlibrary'),
) {
  const result: Record<string, { default?: string; required?: boolean }> = {};

  for (const prop of props.properties) {
    if (ts.isPropertyAssignment(prop)) {
      const name = prop.name?.getText(ast);
      if (ts.isObjectLiteralExpression(prop.initializer)) {
        const defaultProp = prop.initializer.properties.find(
          (p) =>
            ts.isPropertyAssignment(p) && p.name.getText(ast) === 'default',
        ) as ts.PropertyAssignment | undefined;
        const requiredProp = prop.initializer.properties.find(
          (p) =>
            ts.isPropertyAssignment(p) && p.name.getText(ast) === 'required',
        ) as ts.PropertyAssignment | undefined;

        result[name] = {};

        if (requiredProp) {
          const exp = requiredProp.initializer.getText(ast);
          result[name].required = exp === 'true';
        }
        if (defaultProp) {
          const expNode = resolveDefaultOptionExpression(
            (defaultProp as any).initializer,
            ts,
          );
          const expText =
            printer?.printNode(ts.EmitHint.Expression, expNode, ast) ??
            expNode.getText(ast);
          result[name].default = expText;
        }
      }
    }
  }

  return result;
}

export function readTsComponentDefaultProps(
  lang: string,
  tsFileText: string,
  exportName: string,
  printer: ts.Printer | undefined,
  ts: typeof import('typescript/lib/tsserverlibrary'),
) {
  const ast = ts.createSourceFile(
    '/tmp.' + lang,
    tsFileText,
    ts.ScriptTarget.Latest,
  );

  function getComponentNode() {
    let result: ts.Node | undefined;

    if (exportName === 'default') {
      ast.forEachChild((child) => {
        if (ts.isExportAssignment(child)) {
          result = child.expression;
        }
      });
    } else {
      ast.forEachChild((child) => {
        if (
          ts.isVariableStatement(child) &&
          child.modifiers?.some(
            (mod) => mod.kind === ts.SyntaxKind.ExportKeyword,
          )
        ) {
          for (const dec of child.declarationList.declarations) {
            if (dec.name.getText(ast) === exportName) {
              result = dec.initializer;
            }
          }
        }
      });
    }

    return result;
  }

  function getComponentOptionsNode() {
    const component = getComponentNode();

    if (component) {
      // export default { ... }
      if (ts.isObjectLiteralExpression(component)) {
        return component;
      }
      // export default defineComponent({ ... })
      // export default Vue.extend({ ... })
      else if (ts.isCallExpression(component)) {
        if (component.arguments.length) {
          const arg = component.arguments[0];
          if (ts.isObjectLiteralExpression(arg)) {
            return arg;
          }
        }
      }
    }
  }

  function getPropsNode() {
    const options = getComponentOptionsNode();
    const props = options?.properties.find(
      (prop) => prop.name?.getText(ast) === 'props',
    );
    if (props && ts.isPropertyAssignment(props)) {
      if (ts.isObjectLiteralExpression(props.initializer)) {
        return props.initializer;
      }
    }
  }

  const props = getPropsNode();

  if (props) {
    return resolvePropsOption(ast, props, printer, ts);
  }

  return {};
}

export function readVueComponentDefaultProps(
  vueSourceFile: VueFile,
  printer: ts.Printer | undefined,
  ts: typeof import('typescript/lib/tsserverlibrary'),
  vueCompilerOptions: VueCompilerOptions,
) {
  let result: Record<string, { default?: string; required?: boolean }> = {};

  function findObjectLiteralExpression(node: ts.Node) {
    if (ts.isObjectLiteralExpression(node)) {
      return node;
    }
    let result: ts.ObjectLiteralExpression | undefined;
    node.forEachChild((child) => {
      if (!result) {
        result = findObjectLiteralExpression(child);
      }
    });
    return result;
  }

  function scriptSetupWorker() {
    const descriptor = vueSourceFile.sfc;
    const scriptSetupRanges = descriptor.scriptSetupAst
      ? parseScriptSetupRanges(
          ts,
          descriptor.scriptSetupAst,
          vueCompilerOptions,
        )
      : undefined;

    if (descriptor.scriptSetup && scriptSetupRanges?.props.withDefaults?.arg) {
      const defaultsText = descriptor.scriptSetup.content.substring(
        scriptSetupRanges.props.withDefaults.arg.start,
        scriptSetupRanges.props.withDefaults.arg.end,
      );
      const ast = ts.createSourceFile(
        '/tmp.' + descriptor.scriptSetup.lang,
        '(' + defaultsText + ')',
        ts.ScriptTarget.Latest,
      );
      const obj = findObjectLiteralExpression(ast);

      if (obj) {
        for (const prop of obj.properties) {
          if (ts.isPropertyAssignment(prop)) {
            const name = prop.name.getText(ast);
            const expNode = resolveDefaultOptionExpression(
              prop.initializer,
              ts,
            );
            const expText =
              printer?.printNode(ts.EmitHint.Expression, expNode, ast) ??
              expNode.getText(ast);

            result[name] = {
              default: expText,
            };
          }
        }
      }
    } else if (descriptor.scriptSetup && scriptSetupRanges?.props.define?.arg) {
      const defaultsText = descriptor.scriptSetup.content.substring(
        scriptSetupRanges.props.define.arg.start,
        scriptSetupRanges.props.define.arg.end,
      );
      const ast = ts.createSourceFile(
        '/tmp.' + descriptor.scriptSetup.lang,
        '(' + defaultsText + ')',
        ts.ScriptTarget.Latest,
      );
      const obj = findObjectLiteralExpression(ast);

      if (obj) {
        result = {
          ...result,
          ...resolvePropsOption(ast, obj, printer, ts),
        };
      }
    }
  }

  function scriptWorker() {
    const descriptor = vueSourceFile.sfc;

    if (descriptor.script) {
      const scriptResult = readTsComponentDefaultProps(
        descriptor.script.lang,
        descriptor.script.content,
        'default',
        printer,
        ts,
      );
      for (const [key, value] of Object.entries(scriptResult)) {
        result[key] = value;
      }
    }
  }

  scriptSetupWorker();
  scriptWorker();

  return result;
}

export function getTypeArguments(
  typeChecker: ts.TypeChecker,
  type: ts.Type | ts.TypeReference,
) {
  return typeChecker.getTypeArguments(type as ts.TypeReference);
}

/**
 * Get function signatures
 */
export function getFunctionSignatures(
  typeChecker: ts.TypeChecker,
  symbol: ts.Symbol,
) {
  const node = getNodeOfSymbol(symbol);
  if (node) {
    const type = typeChecker.getTypeAtLocation(node);
    return type.getCallSignatures();
  }
  return [];
}

/**
 * Whether it is a functional Vue component
 * @description
 * This can only be determined by the introduced type names,
 * because these types may be introduced from vue, from vue-demi, or even from other third-party packages.
 */
export function isFunctionalVueComponent(
  typeChecker: ts.TypeChecker,
  symbol: ts.Symbol,
) {
  const node = getNodeOfSymbol(symbol);
  if (node) {
    const type = typeChecker.getTypeAtLocation(node);
    // if using FunctionalComponent for type annotation
    if (type?.symbol?.escapedName === 'FunctionalComponent') {
      return true;
    }
    // determined by returned type
    const signatures = type.getCallSignatures();
    if (!signatures || !signatures.length) return false;
    const returnType = signatures[0].getReturnType();
    const baseType = returnType.getBaseTypes();
    if (baseType?.length) {
      return baseType[0].getSymbol()?.escapedName === 'VNode';
    }
  }
  return false;
}
