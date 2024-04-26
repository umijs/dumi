import path from 'node:path';
import {
  PropertyMetaKind,
  type RefPropertyMetaSchema,
  type UnknownSymbolResolver,
} from '../../types';

export const externalSymbolResolver: UnknownSymbolResolver<
  RefPropertyMetaSchema
> = ({ ts, schemaOptions, targetSymbol, targetNode }) => {
  const { disableExternalLinkAutoDectect, externalSymbolLinkMappings } =
    schemaOptions;
  const fileName = targetNode.getSourceFile().fileName;
  const name = targetSymbol.getName();

  let externalUrl: string = '';
  const tsLibPath = path.normalize('/node_modules/typescript/lib/');
  const normalizeFileName = path.normalize(fileName);
  if (
    !disableExternalLinkAutoDectect &&
    normalizeFileName.indexOf(tsLibPath) >= 0
  ) {
    const jsdoc = ts.getJSDocCommentsAndTags(targetNode);
    const comment = jsdoc?.[0]?.comment;
    if (comment && typeof comment === 'string') {
      const [, url] = comment.match(/\[MDN\s*Reference\]\(([^()]+)\)/i) || [];
      if (url) {
        externalUrl = url;
      }
    }
  }
  if (!externalSymbolLinkMappings) {
    if (!externalUrl) {
      return {};
    }
    return { kind: PropertyMetaKind.REF, externalUrl, name };
  }

  Object.entries(externalSymbolLinkMappings).some(([lib, types]) => {
    const libPath = path.normalize(`/node_modules/${lib}/`);
    if (normalizeFileName.indexOf(libPath) >= 0) {
      const url = types[name];
      if (url) {
        externalUrl = url;
        return true;
      }
    }
    return false;
  });
  if (!externalUrl) return {};
  return { kind: PropertyMetaKind.REF, externalUrl, name };
};
