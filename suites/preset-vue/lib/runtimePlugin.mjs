var m="vue demo",B="An auto-generated vue demo by dumi",D=(e,t,n)=>`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${t}" />
        <title>${e}</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="${n}"><\/script>
    </body>
</html>
`,R=(e,t)=>`
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
${e?"import vueJsx from '@vitejs/plugin-vue-jsx';":""}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
      vue(),${e?"vueJsx()":""}
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./${t}', import.meta.url))
        }
    }
});`,O=e=>`
import { createApp } from 'vue';
import App from './${e}';

const app = createApp(App);
app.config.errorHandler = (err) => console.error(err);
app.mount('#app');
`,P=`
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`,C={less:["less","^4.2.0"],scss:["sass","^1.68.0"],sass:["sass","^1.68.0"],styl:["stylus","^0.60.0"]};function h(e){let t=/(.+)\.(\w+)$/i.exec(e);if(!t)return t;let[,n,i]=t;return {name:n,ext:i}}function E(e){return e.entry?e.entry:e.dependencies["index.vue"]?"index.vue":"index.tsx"}function v({asset:e,title:t=m,description:n=B}){let i=E(e),c=h(i);if(!c)return {};let{name:a,ext:r}=c,s=r==="vue"||r==="tsx",p="src/",o={[`vite.config.${s?"ts":"js"}`]:{content:R(s,p),isBinary:!1}};s&&(o["tsconfig.json"]={content:P,isBinary:!1});let d={},u={"@vitejs/plugin-vue":"~4.0.0",vite:"~4.0.0"},x=a==="index"?`App.${r}`:i;Object.entries(e.dependencies).forEach(([l,{type:$,value:y}])=>{$==="NPM"?d[l]=y:o[l===i?`${p}${x}`:`${p}${l}`]={content:y,isBinary:!1};let j=h(l);if(!j)return;let b=C[j.ext];if(!b)return;let[w,A]=b;u[w]=A;}),d.vue??="^3.3",d["vue-router"]??="^4.2";let f=s?`${p}index.ts`:`${p}index.js`;return s&&Object.assign(u,{"@tsconfig/node18":"~18.2.2","@types/node":"~18.17.17","@vitejs/plugin-vue-jsx":"~3.0.2","@vue/tsconfig":"~0.4.0",typescript:"~5.2.0","vue-tsc":"~1.8.11"}),o["package.json"]={content:JSON.stringify({description:n,main:f,dependencies:d,scripts:{dev:"vite",build:"vite build",preview:"vite preview"},browserslist:["> 0.2%","not dead"],devDependencies:u},null,2),isBinary:!1},o["index.html"]={content:D(t,n,f),isBinary:!1},o[f]={content:O(x),isBinary:!1},o}function V(e,t){let{title:n,description:i}=t,c={title:n||m,description:i,template:"node",files:{},dependencies:{}},a=v(t);return c.files=Object.entries(a).reduce((r,[g,s])=>(r[g]=s.content,r),{}),Object.assign(e,c),e}function F(e,t){return Object.assign(e,{files:v(t)}),e}

export { F as modifyCodeSandboxData, V as modifyStackBlitzData };
