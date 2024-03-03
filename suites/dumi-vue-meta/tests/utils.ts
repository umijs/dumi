import { ComponentItemMeta } from '../src';

export function toRecord(metaArr: ComponentItemMeta[]) {
  return metaArr.reduce((acc, prop) => {
    acc[prop.name] = prop;
    return acc;
  }, {} as Record<string, ComponentItemMeta>);
}
