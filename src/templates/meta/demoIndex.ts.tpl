export const demoIndexMap = {
  {{#metaFiles}}
  {{#loadDemoIndexMap}}
  '{{{id}}}': () =>
    import('{{{file}}}?type=demo-index').then(
      ({ demoIndex }) => demoIndex,
    ),
  {{/loadDemoIndexMap}}
  {{/metaFiles}}
};
