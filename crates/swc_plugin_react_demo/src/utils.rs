use swc_core::{
  ecma::ast::{Stmt, ReturnStmt, Expr, ObjectLit, PropOrSpread, Prop, KeyValueProp, Ident, PropName},
  common::{DUMMY_SP, Span},
};

/**
 * create a return statement with a default property
 */
pub fn create_return_with_default(e: Expr, s: Span) -> Stmt {
  Stmt::Return(ReturnStmt {
    span: s,
    arg: Some(Box::new(Expr::Object(ObjectLit {
      span: DUMMY_SP,
      props: vec![PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
        key: PropName::Ident(Ident::new("default".into(), DUMMY_SP)),
        value: Box::new(e),
      })))],
    }))),
  })
}
