var v="vue demo",B="An auto-generated vue demo by dumi",d=()=>!!window.ts,R=(e,t,n)=>`
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
`,O=(e,t)=>{let n=d();return `
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
${e?`import vueJsx from ${n?"'@vue3-oop/plugin-vue-jsx'":"'@vitejs/plugin-vue-jsx'"};`:""}

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
});`},P=e=>`
${d()?"import '@abraham/reflection'":""}
import { createApp } from 'vue';
import App from './${e}';

const app = createApp(App);
app.config.errorHandler = (err) => console.error(err);
app.mount('#app');
`,C=()=>`
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    ${d()?`"isolatedModules": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false,
    "verbatimModuleSyntax": true,`:""}
    "allowImportingTsExtensions": true,
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`,E={less:["less","^4.2.0"],scss:["sass","^1.68.0"],sass:["sass","^1.68.0"],styl:["stylus","^0.60.0"]};function w(e){let t=/(.+)\.(\w+)$/i.exec(e);if(!t)return t;let[,n,i]=t;return {name:n,ext:i}}function F(e){return e.entry?e.entry:e.dependencies["index.vue"]?"index.vue":"index.tsx"}function g({asset:e,title:t=v,description:n=B}){let i=F(e),c=w(i);if(!c)return {};let{name:l,ext:r}=c,s=r==="vue"||r==="tsx",y=d(),p="src/",o={[`vite.config.${s?"ts":"js"}`]:{content:O(s,p),isBinary:!1}};s&&(o["tsconfig.json"]={content:C(),isBinary:!1});let a={},f={"@vitejs/plugin-vue":"~5.2.1",vite:"~6.0.3"},j=l==="index"?`App.${r}`:i;Object.entries(e.dependencies).forEach(([u,{type:D,value:b}])=>{D==="NPM"?a[u]=b:o[u===i?`${p}${j}`:`${p}${u}`]={content:b,isBinary:!1};let $=w(u);if(!$)return;let h=E[$.ext];if(!h)return;let[M,A]=h;f[M]=A;}),a.vue??="^3.3",a["vue-router"]??="^4.2",y&&(a["@abraham/reflection"]="^0.12.0",a["injection-js"]="^2.4.0");let m=s?`${p}index.ts`:`${p}index.js`;return s&&Object.assign(f,{"@tsconfig/node18":"~18.2.2","@types/node":"~18.17.17","@vue/tsconfig":"~0.4.0",typescript:"~5.2.0","vue-tsc":"~1.8.11"},y?{"@vue3-oop/plugin-vue-jsx":"~1.4.6"}:{"@vitejs/plugin-vue-jsx":"~4.0.0"}),o["package.json"]={content:JSON.stringify({description:n,main:m,dependencies:a,scripts:{dev:"vite",build:"vite build",preview:"vite preview"},browserslist:["> 0.2%","not dead"],devDependencies:f},null,2),isBinary:!1},o["index.html"]={content:R(t,n,m),isBinary:!1},o[m]={content:P(j),isBinary:!1},o}function N(e,t){let{title:n,description:i}=t,c={title:n||v,description:i,template:"node",files:{},dependencies:{}},l=g(t);return c.files=Object.entries(l).reduce((r,[x,s])=>(r[x]=s.content,r),{}),Object.assign(e,c),e}function V(e,t){return Object.assign(e,{files:g(t)}),e}

export { V as modifyCodeSandboxData, N as modifyStackBlitzData };
