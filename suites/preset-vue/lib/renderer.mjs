import { createApp } from 'vue';

var _=async function(s,e){e.__css__&&setTimeout(()=>{document.querySelectorAll(`style[css-${e.__id__}]`).forEach(r=>r.remove()),document.head.insertAdjacentHTML("beforeend",`<style css-${e.__id__}>${e.__css__}</style>`);},1);let t=createApp(e);return t.config.errorHandler=function(r){throw r},t.mount(s),()=>{t.unmount();}},o=_;

export { o as default };
