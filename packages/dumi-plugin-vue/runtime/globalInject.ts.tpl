import { App } from 'vue';
{{#globalInject.imports}}
  {{{globalInject.imports}}}
{{/globalInject.imports}}

export function globalInject (app: App<Element>) {
  // do something here
{{#globalInject.statements}}
  {{{globalInject.statements}}}
{{/globalInject.statements}}
}
