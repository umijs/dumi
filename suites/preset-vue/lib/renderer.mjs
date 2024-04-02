import { createApp, h, nextTick } from 'vue';

function c(i){return new Promise((t,n)=>{let e=document.createElement("div");e.style.width="0",e.style.height="0",e.style.visibility="hidden",document.body.appendChild(e);let r;function o(){nextTick(()=>{r.config.errorHandler=void 0,r.unmount(),e.remove();});}r=createApp({mounted(){t(),o();},render(){return h(i)}}),r.config.warnHandler=d=>{o(),n(d);},r.config.errorHandler=d=>{o(),n(d);},r.mount(e);})}var u=async function(i,t,n){t.__css__&&setTimeout(()=>{document.querySelectorAll(`style[css-${t.__id__}]`).forEach(r=>r.remove()),document.head.insertAdjacentHTML("beforeend",`<style css-${t.__id__}>${t.__css__}</style>`);},1),await c(t);let e=createApp(t);return e.config.errorHandler=function(r){n?.onRuntimeError?.(r);},e.mount(i),()=>{e.unmount();}},_=u;

export { _ as default };
