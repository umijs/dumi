import type { IRouteMeta } from 'dumi';

const textIndexes: Record<string, () => Promise<Pick<IRouteMeta, 'texts' | 'toc'>>> = {
  {{#metaFiles}}
  '{{{id}}}': () => import('{{{file}}}?type=text'),
  {{/metaFiles}}
};

/** Async to load demo by id */
export const getTextById = async (id: string) => {
  const getter = textIndexes[id];

  if (!getter) {
    return null;
  }

  return await getter();
};