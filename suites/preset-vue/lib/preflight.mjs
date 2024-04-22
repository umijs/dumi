import { createApp, h, nextTick } from 'vue';

function u(d){return new Promise((i,t)=>{let n=document.createElement("div");n.style.display="none",n.style.overflow="hidden",document.body.appendChild(n);let e;function r(){nextTick(()=>{e.config.errorHandler=void 0,e.unmount(),n.remove();});}e=createApp({mounted(){i(),r();},render(){return h(d)}}),e.config.warnHandler=o=>{r(),t(new Error(o));},e.config.errorHandler=o=>{r(),t(o);},e.mount(n);})}

export { u as default };
