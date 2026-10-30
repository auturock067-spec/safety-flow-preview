'use strict';
(async()=>{
 const server=new URLSearchParams(location.search).get('mode')==='server';
 const files=server?['i18n.js','core.js','server-inspection-ui.js','server-app.js']:['i18n.js','core.js','inspection-core.js','inspection-ui.js','app.js'];
 for(const file of files)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./'+file;script.onload=resolve;script.onerror=()=>reject(new Error('页面组件加载失败，请刷新重试'));document.body.append(script);});
})().catch(e=>{document.querySelector('#message').textContent=e.message;});
