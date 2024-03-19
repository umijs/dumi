import { createApp } from 'vue';

var _=function(s,e){e.__css__&&setTimeout(()=>{document.querySelectorAll(`style[css-${e.__id__}]`).forEach(t=>t.remove()),document.head.insertAdjacentHTML("beforeend",`<style css-${e.__id__}>${e.__css__}</style>`);},1);let r=createApp(e);return r.config.errorHandler=t=>console.error(t),r.mount(s),()=>{r.unmount();}},l=_;

export { l as default };
