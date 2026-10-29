'use strict';
(()=>{
 const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const stages={report:'待确认',action:'整改中',verify:'待验收',closed:'已关闭'};
 let user=null,epoch=0,sequence=0,rows=[],cursor=null,currentView='reports',pending=null,detailSequence=0,inspectionUI=null,capabilities=[],exportBusy=false;
 const message=(v,error=false)=>{$('#message').textContent=v;$('#message').className=error?'message error':'message';};
 document.body.classList.add('server-mode');
 const note=document.querySelector('.note');
 note.innerHTML='<strong>账号联调模式 · 未完成正式验收</strong><p>仅连接当前站点真实接口；不会读取或上传本机测试记录。巡检能力按服务配置启用；模板管理、月报及完整备份尚未接入此模式。</p><a href="./">返回本机测试模式</a>';
 document.title='Safety Flow 安巡记 · 账号联调';
 document.querySelector('.hero p').textContent='巡查人员上报，安全管理人员确认并分派，责任人整改，由独立复核人员验收。';
 document.querySelector('.topbar .eyebrow').textContent='AUTHENTICATED API TEST';
 $('#searchInput').placeholder='地点、问题描述';
 $('#resetBtn').hidden=true;$('#actorInput').closest('label').hidden=true;
 $('#exportJson').hidden=true;$('#exportCsv').hidden=false;$('#exportCsv').disabled=true;$('#exportCsv').textContent='导出全部匹配台账 CSV';document.querySelector('.backup-control').hidden=true;
 document.querySelectorAll('main > .note')[1].textContent='账号模式仍在联调，当前范围为问题整改及已配置的巡检服务。不能作为正式验收通过的版本。';
 $('#photoInput').nextElementSibling.textContent='可选，最多3张、单张不超过1MB；提交成功后保存至当前测试服务。';
 const login=document.createElement('section');login.className='note';
 login.innerHTML='<form id="loginForm"><label>账号<input id="loginName" autocomplete="username" required maxlength="100"></label><label>密码<input id="loginPassword" type="password" autocomplete="current-password" required maxlength="128"></label><button id="loginSubmit" class="primary">登录测试服务</button></form><p id="sessionLabel"></p><button id="logoutBtn" type="button" class="ghost" hidden>退出账号</button>';
 note.after(login);
 const more=document.createElement('button');more.className='ghost';more.textContent='下一页';more.hidden=true;$('#list').after(more);
 const extra=document.createElement('div');extra.innerHTML='<label>隐患分类<input id="serverHazard" maxlength="100" required placeholder="例如：消防"></label><label>风险等级<input id="serverRisk" maxlength="100" required placeholder="由安全管理人员独立评估"></label>';$('#assignFields').append(extra);
 for(const b of document.querySelectorAll('.nav')){
  if(['templates','monthly','overdue'].includes(b.dataset.view)){b.disabled=true;b.title='此功能尚未连接账号服务；本机模式仍可测试';}
  else b.onclick=()=>{if(inspectionUI&&!inspectionUI.canLeave())return;inspectionUI?.reset();$('#searchInput').disabled=false;currentView=b.dataset.view;$('#stageInput').disabled=currentView!=='ledger';$('#stageInput').value=({reports:'report',actions:'action',verify:'verify'})[currentView]||'';document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));loadPage();};
 }
 function updateExport(){ $('#exportCsv').disabled=exportBusy||!user||!capabilities.includes('report.export')||!['reports','actions','verify','ledger'].includes(currentView); }
 function clearSession(){
  user=null;updateExport();epoch++;sequence++;detailSequence++;inspectionUI?.reset();capabilities=[];for(const b of document.querySelectorAll('[data-view="inspection"],[data-view="inspectionHistory"]'))b.disabled=true;rows=[];cursor=null;pending=null;$('#list').replaceChildren();$('#stats').textContent='请登录测试账号';more.hidden=true;
  $('#loginForm').hidden=false;for(const control of $('#loginForm').elements)control.disabled=location.protocol!=='https:';$('#logoutBtn').hidden=true;$('#sessionLabel').textContent='';
  $('#newReportBtn').disabled=true;$('#reportForm').reset();$('#actionForm').reset();
  for(const d of document.querySelectorAll('dialog'))if(d.open)d.close();
 }
 async function api(path,{body,method=body===undefined?'GET':'POST',format='json'}={}){
  if(location.protocol!=='https:')throw new Error('账号模式需要 HTTPS 连接；当前页面不能登录，请返回本机测试模式');
  const generation=epoch,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',redirect:'error',signal:controller.signal,headers:body===undefined?{}:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
   let data;if(response.ok&&format==='csv'){if(!(response.headers.get('Content-Type')||'').startsWith('text/csv'))throw new Error('服务端没有返回CSV，未下载文件');data=await response.blob();}else data=await response.json().catch(()=>{throw new Error('当前站点未配置可用的账号接口');});
   if(!response.ok){if(response.status===401&&generation===epoch)clearSession();throw new Error(data.error||'接口请求失败');}
   if(generation!==epoch)throw new Error('账号状态已改变，请重新操作');
   return data;
  }catch(e){if(e.name==='AbortError')throw new Error('请求超时，结果尚未确认；请刷新核对后再提交');throw e;}
  finally{clearTimeout(timer);}
 }
 function signedIn(value,caps=[]){
  capabilities=caps;for(const b of document.querySelectorAll('[data-view="inspection"],[data-view="inspectionHistory"]'))b.disabled=!caps.includes("inspection.read");
  user=value;epoch++;$('#loginForm').hidden=true;$('#loginPassword').value='';$('#logoutBtn').hidden=false;
  $('#sessionLabel').textContent=user.name+' · '+user.role;
  $('#newReportBtn').disabled=!['inspector','manager','admin'].includes(user.role);loadPage();
 }
 function filters(){
  const query=new URLSearchParams(),stage=({reports:'report',actions:'action',verify:'verify'})[currentView]||$('#stageInput').value;
  if(stage)query.set('stage',stage);const q=$('#searchInput').value.trim();if(q)query.set('q',q);query.set('limit','20');return query;
 }
 async function loadPage(after){
  updateExport();if(!user)return;const request=++sequence,generation=epoch;if(['inspection','inspectionHistory'].includes(currentView))return inspectionUI.list(currentView,after);more.disabled=true;
  try{
   const query=filters();if(after)query.set('cursor',after);
   const result=await api('/api/reports?'+query);
   if(request!==sequence||generation!==epoch)return;
   rows=result.items;cursor=result.nextCursor;more.hidden=!cursor;
   $('#viewTitle').textContent=({reports:'待确认',actions:'整改中',verify:'待验收',ledger:'台账'})[currentView];
   $('#viewEyebrow').textContent='SERVER RECORDS';
   $('#stats').textContent='当前页 '+rows.length+' 条'+(cursor?' · 还有后续页':'')+'（不是全单位统计）';
   $('#list').innerHTML=rows.length?rows.map(x=>'<article class="card" data-id="'+esc(x.id)+'"><h4>'+esc(x.location)+' · '+esc(stages[x.stage])+'</h4><p>'+esc(x.description)+'</p><small>'+esc(x.id)+'</small><div><button class="ghost" data-server-detail="'+esc(x.id)+'">查看详情与操作</button></div></article>').join(''):'<p>当前范围没有记录。</p>';
   message('已读取当前账号可见的服务端记录。');
  }catch(e){if(request===sequence){rows=[];$('#list').replaceChildren();$('#stats').textContent='读取未完成';more.hidden=true;message(e.message,true);}}
  finally{if(request===sequence)more.disabled=false;}
 }
 more.onclick=()=>loadPage(cursor);
 for(const id of ['searchInput','stageInput'])$('#'+id).onchange=()=>loadPage();
 $('#loginForm').onsubmit=async e=>{
  e.preventDefault();$('#loginSubmit').disabled=true;
  try{await api('/api/login',{body:{username:$('#loginName').value,password:$('#loginPassword').value}});const session=await api('/api/session');signedIn(session.user,session.capabilities);}
  catch(e){message(e.message,true);}
  finally{$('#loginPassword').value='';$('#loginSubmit').disabled=false;}
 };
 $('#logoutBtn').onclick=async()=>{
  if(inspectionUI&&!inspectionUI.canLeave())return;
  $('#logoutBtn').disabled=true;
  try{await api('/api/logout',{body:{}});clearSession();message('已退出，服务端会话已撤销。');}
  catch(e){message('退出尚未确认：'+e.message,true);}
  finally{$('#logoutBtn').disabled=false;}
 };
 async function photos(input){
  const files=[...input.files];if(files.length>3)throw Error('每次最多3张图片');
  return Promise.all(files.map(async f=>{
   if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>1048576)throw Error('请选择1MB以内的PNG/JPEG/WebP图片');
   const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('读取图片失败'));r.readAsDataURL(f);});
   const image=new Image();image.src=data;await image.decode().catch(()=>{throw Error('图片无法解码');});return {name:f.name,data};
  }));
 }
 $('#newReportBtn').onclick=()=>{if(!user)return;if(inspectionUI&&!inspectionUI.canLeave())return;$('#reportError').textContent='';$('#reportDialog').showModal();};
 $('#reportForm').onsubmit=async e=>{
  e.preventDefault();$('#submitReport').disabled=true;const generation=epoch;
  try{const input={location:$('#locationInput').value,desc:$('#descInput').value,photos:await photos($('#photoInput'))};if(generation!==epoch)throw Error('账号已改变，请重新登录后填写');await api('/api/reports',{body:input});if(generation!==epoch)return;$('#reportForm').reset();$('#reportDialog').close();await loadPage();}
  catch(e){$('#reportError').textContent=e.message;}
  finally{$('#submitReport').disabled=false;}
 };
 async function detail(id){
  const generation=epoch,request=++detailSequence;
  const d=await api('/api/reports/'+encodeURIComponent(id));if(generation!==epoch||request!==detailSequence)return;
  const x=d.value;pending={id,revision:d.revision,value:x};
  const actions=[];
  if(x.stage==='report'&&['admin','manager'].includes(user.role))actions.push(['assign','确认并分派']);
  if(x.stage==='action'&&x.assigneeId===user.id&&user.role==='worker')actions.push(['rectify','提交整改']);
  if(x.stage==='verify'&&user.role==='reviewer'&&x.rectifierId!==user.id)actions.push(['approve','验收通过'],['reject','退回整改']);
  const evidence=[...(x.reportEvidence||[]),...(x.rectificationEvidence||[])];
  $('#detailContent').innerHTML='<button class="ghost" data-close="detailDialog">关闭</button><h3>'+esc(x.location)+'</h3><p>'+esc(x.desc)+'</p><p>'+esc(stages[x.stage])+' · '+esc(x.assignee||'尚未分派')+'</p><p>分类：'+esc(x.hazardClassification)+' / 风险：'+esc(x.riskLevel)+'</p>'+actions.map(([a,label])=>'<button class="primary" data-server-action="'+a+'">'+label+'</button>').join('')+'<h4>图片证据</h4>'+evidence.filter(p=>/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(p.data)).map(p=>'<img alt="'+esc(p.name)+'" src="'+p.data+'" style="max-width:100%;max-height:300px">').join('')+'<h4>服务端审计历史</h4>'+x.history.map(h=>'<p>'+esc(h.at)+' · '+esc(h.actor)+' · '+esc(h.action)+' · '+esc(h.note)+'</p>').join('');
  $('#detailDialog').showModal();
 }
 document.addEventListener('click',async e=>{
  const close=e.target.closest('[data-close]');if(close){$('#'+close.dataset.close).close();return;}
  const d=e.target.closest('[data-server-detail]'),a=e.target.closest('[data-server-action]');
  try{
   if(d)await detail(d.dataset.serverDetail);
   if(a&&pending){
    const action=a.dataset.serverAction,generation=epoch,record=pending;pending.action=action;$('#actionForm').reset();$('#actionError').textContent='';$('#actionTitle').textContent=a.textContent;
    $('#assignFields').hidden=action!=='assign';$('#serverHazard').required=action==='assign';$('#serverRisk').required=action==='assign';
    $('#actionPhotoLabel').hidden=action!=='rectify';
    if(action==='assign'){
     const result=await api('/api/assignees');if(generation!==epoch||pending!==record)return;$('#actionAssignee').innerHTML=result.items.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('');
     if(!result.items.length)throw Error('尚无有效责任人，请由管理员配置');
    }
    $('#detailDialog').close();$('#actionDialog').showModal();
   }
  }catch(e){message(e.message,true);}
 });
 $('#actionForm').onsubmit=async e=>{
  e.preventDefault();if(!pending)return;$('#submitAction').disabled=true;const p={...pending},generation=epoch;
  try{
   let input;
   if(p.action==='assign')input={assigneeId:$('#actionAssignee').value,due:new Date($('#actionDue').value).toISOString(),requirement:$('#actionNote').value,hazardClassification:$('#serverHazard').value,riskLevel:$('#serverRisk').value};
   else input={note:$('#actionNote').value,...(p.action==='rectify'?{photos:await photos($('#actionPhotos'))}:{})};
   if(generation!==epoch)throw Error('账号已改变，请重新打开记录');
   await api('/api/reports/'+encodeURIComponent(p.id)+'/commands',{body:{expectedRevision:p.revision,action:p.action,input}});
   if(generation!==epoch)return;$('#actionForm').reset();$('#actionDialog').close();pending=null;await loadPage();
  }catch(e){$('#actionError').textContent=e.message+'；若版本冲突，请重新打开详情。';}
  finally{$('#submitAction').disabled=false;}
 };
 inspectionUI=SafetyAccountInspections({api,user:()=>user,epoch:()=>epoch,esc,photos,message,view:()=>currentView,pager:c=>{cursor=c;more.hidden=!c;more.disabled=false;}});
 $('#exportCsv').onclick=async()=>{
  if(!user||$('#exportCsv').disabled)return;const generation=epoch,query=filters();query.delete('limit');query.delete('cursor');exportBusy=true;updateExport();
  try{const blob=await api('/api/reports/export.csv?'+query,{format:'csv'});if(generation!==epoch)return;
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='safety-flow-ledger-'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   message('已导出当前筛选的全部匹配记录（服务端导出时快照，最多5000条）。');
  }catch(e){message(e.message==='EXPORT_TOO_LARGE'?'超过5000条，请缩小搜索或状态范围后导出，未下载截断文件。':e.message,true);}
  finally{exportBusy=false;updateExport();}
 };
 $('#stageInput').disabled=true;$('#stageInput').value='report';
 clearSession();
 api('/api/session').then(s=>signedIn(s.user,s.capabilities)).catch(e=>message(e.message==='AUTH_REQUIRED'?'请登录已配置的测试账号。':e.message,true));
})();
