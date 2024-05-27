import path from 'node:path';
import { ComponentItemMeta } from '../src';

export function toRecord(metaArr: ComponentItemMeta[]) {
  return metaArr.reduce((acc, prop) => {
    acc[prop.name] = prop;
    return acc;
  }, {} as Record<string, ComponentItemMeta>);
}

export const rootPath = path.resolve(__dirname, '../../../');
export const fixturesPath = path.resolve(__dirname, './fixtures');
export const entry = path.resolve(__dirname, 'fixtures/index.ts');
export const tsconfigPath = path.resolve(__dirname, 'fixtures/tsconfig.json');
