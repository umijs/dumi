use crate::utils::create_return_with_default;
use swc_core::{
  common::{util::take::Take, Spanned, DUMMY_SP},
  ecma::{ast::*, transforms::testing::test_inline, visit::*},
  plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

mod utils;
pub struct ReactDemoVisitor;

/**
 * implement `VisitMut` trait for transform `export` to `return`, and transform `import` to `await import`
 */
impl VisitMut for ReactDemoVisitor {
  fn visit_mut_module_item(&mut self, n: &mut ModuleItem) {
    if let ModuleItem::ModuleDecl(module_decl) = n.clone() {
      match module_decl {
        ModuleDecl::Import(import_decl) => {
          // transform import declaration to await import declaration
          if !import_decl.type_only {
            // skip non-type import
            let name: Pat = if let Some(import) =
              import_decl.specifiers.iter().find(|s| s.is_namespace())
            {
              // extract local name from `import * as x from'y'`
              Pat::Ident(import.clone().namespace().unwrap().local.into())
            } else {
              // extract local name from `import x from 'y'` and `import { x } from 'y'`
              // and transform to { default: x } or { x: x }
              let props: Vec<ObjectPatProp> = import_decl
                .specifiers
                .iter()
                .map::<ObjectPatProp, _>(|s| {
                  match s {
                    ImportSpecifier::Default(import_default) => {
                      // transform default import to { default: x }
                      ObjectPatProp::KeyValue(KeyValuePatProp {
                        key: PropName::Ident(Ident::new("default".into(), import_default.span)),
                        value: import_default.clone().local.into(),
                      })
                    }
                    ImportSpecifier::Named(import_named) => {
                      // transform non-default import, e.g. { y: x } or { 'y*y': x } or { x: x }
                      let key: PropName = match &import_named.imported {
                        Some(ModuleExportName::Ident(ident)) => PropName::Ident(ident.clone()),
                        Some(ModuleExportName::Str(str)) => PropName::Str(str.clone()),
                        None => PropName::Ident(import_named.local.clone()),
                      };

                      ObjectPatProp::KeyValue(KeyValuePatProp {
                        key,
                        value: import_named.clone().local.into(),
                      })
                    }
                    ImportSpecifier::Namespace(_) => unreachable!("already handle in prev if arm"),
                  }
                })
                .collect();

              Pat::Object(ObjectPat {
                span: import_decl.span,
                props,
                optional: false,
                type_ann: None,
              })
            };

            // replace import declaration to variable declaration with await import
            *n = ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
              kind: VarDeclKind::Const,
              declare: false,
              span: n.span(),
              decls: vec![VarDeclarator {
                // variable name
                name,
                // await import expression
                init: Some(Box::new(Expr::Await(AwaitExpr {
                  span: DUMMY_SP,
                  arg: CallExpr {
                    span: DUMMY_SP,
                    callee: Callee::Import(Import::dummy()),
                    args: vec![ExprOrSpread {
                      spread: None,
                      expr: Box::new(Expr::Lit(Lit::Str(*import_decl.src))),
                    }],
                    type_args: None,
                  }
                  .into(),
                }))),
                span: DUMMY_SP,
                definite: false,
              }],
            }))));
          }
        }
        ModuleDecl::ExportDefaultExpr(export_expr) => {
          // transform export default expression to return statement
          *n = ModuleItem::Stmt(create_return_with_default(*export_expr.expr, n.span()));
        }
        ModuleDecl::ExportDefaultDecl(export_decl) => {
          // transform export default declaration to return statement
          match export_decl.decl {
            DefaultDecl::Class(c) => {
              *n = ModuleItem::Stmt(create_return_with_default(Expr::Class(c), n.span()));
            }
            DefaultDecl::Fn(f) => {
              *n = ModuleItem::Stmt(create_return_with_default(Expr::Fn(f), n.span()));
            }
            DefaultDecl::TsInterfaceDecl(_) => { /* omit interface declaration */ }
          }
        }
        ModuleDecl::ExportNamed(_) => {
          unreachable!("export named should be transform to export default")
        }
        _ => { /* omit other declarations */ }
      }
    }
  }
}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
  program.fold_with(&mut as_folder(ReactDemoVisitor))
}

test_inline!(
  Default::default(),
  |_| as_folder(ReactDemoVisitor),
  imports,
  // input
  r#"import a from 'a';
import { b } from 'b';
import { c1 as c } from 'c';
import * as d from 'd';
import e, { e1, e2 as e3 } from 'e';"#,
  // output
  r#"const { default: a  } = await import('a');
const { b: b  } = await import('b');
const { c1: c  } = await import('c');
const d = await import('d');
const { default: e , e1: e1 , e2: e3  } = await import('e');"#
);

test_inline!(
  Default::default(),
  |_| as_folder(ReactDemoVisitor),
  exports,
  // input
  r#"export default a;
export default () => null;
export default class A {}"#,
  // output
  r#"return {
    default: a
};
return {
    default: ()=>null
};
return {
    default: class A {
    }
};"#
);
