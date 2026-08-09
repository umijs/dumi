{{#metaFiles}}
{{#loadDemoIndex}}
import { frontmatter as fm{{{index}}}, toc as t{{{index}}}, demoIndex as dmi{{{index}}} } from '{{{file}}}?type=frontmatter';
{{/loadDemoIndex}}
{{^loadDemoIndex}}
import { frontmatter as fm{{{index}}}, toc as t{{{index}}}{{#enableUtoopackHMR}}{{#isMarkdown}}, routeStructureHash as rsh{{{index}}}{{/isMarkdown}}{{/enableUtoopackHMR}} } from '{{{file}}}?type=frontmatter';
{{/loadDemoIndex}}
{{/metaFiles}}

{{#enableUtoopackHMR}}
const nextFilesMeta = {
{{/enableUtoopackHMR}}
{{^enableUtoopackHMR}}
export const filesMeta = {
{{/enableUtoopackHMR}}
  {{#metaFiles}}
  '{{{id}}}': {
    frontmatter: fm{{{index}}},
    toc: t{{{index}}},
    {{#loadDemoIndex}}
    demoIndex: dmi{{{index}}},
    {{/loadDemoIndex}}
    {{#tabs}}
    tabs: {{{tabs}}},
    {{/tabs}}
    {{#isMarkdown}}
    textGetter: () => import({{{chunkName}}}'{{{file}}}?type=text'),
    {{/isMarkdown}}
  },
  {{/metaFiles}}
}

{{#enableUtoopackHMR}}
const dumiGlobal = globalThis as any;
dumiGlobal.__DUMI_FILES_META__ = dumiGlobal.__DUMI_FILES_META__ || {};
const filesMeta = dumiGlobal.__DUMI_FILES_META__;
Object.keys(filesMeta).forEach((id) => delete filesMeta[id]);
Object.assign(filesMeta, nextFilesMeta);
export { filesMeta };

const nextMetaStructureHash = JSON.stringify([
  '{{{metaStructureHash}}}',
  {{#metaFiles}}
  {{#isMarkdown}}rsh{{{index}}},{{/isMarkdown}}
  {{^isMarkdown}}JSON.stringify([fm{{{index}}}, t{{{index}}}]),{{/isMarkdown}}
  {{/metaFiles}}
]);
const previousMetaStructureHash = dumiGlobal.__DUMI_META_INDEX_STRUCTURE_HASH__;
const didMetaStructureChange = previousMetaStructureHash !== undefined && previousMetaStructureHash !== nextMetaStructureHash;
dumiGlobal.__DUMI_META_INDEX_STRUCTURE_HASH__ = nextMetaStructureHash;

if (module.hot) {
  // Dynamic imports have an async-loader wrapper module. Accept at this
  // stable metadata boundary as well as inside the loaded text module so an
  // already-loaded search chunk cannot invalidate the global runtime graph.
  module.hot.accept();
  if (didMetaStructureChange) {
    module.hot.invalidate();
  }
}
{{/enableUtoopackHMR}}

export { tabs as tabsMeta } from './tabs';
