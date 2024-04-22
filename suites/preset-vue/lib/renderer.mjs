import { createApp } from 'vue';

var _=async function(n,e,s){e.__css__&&setTimeout(()=>{document.querySelectorAll(`style[css-${e.__id__}]`).forEach(t=>t.remove()),document.head.insertAdjacentHTML("beforeend",`<style css-${e.__id__}>${e.__css__}</style>`);},1);let r=createApp(e);return r.config.errorHandler=function(t){s?.onRuntimeError?.(t);},r.mount(n),()=>{r.unmount();}},i=_;

export { i as default };
