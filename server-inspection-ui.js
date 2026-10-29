'use strict';
window.SafetyAccountInspections=function({api,user,epoch,esc,photos,message,view,pager}){
 const $=s=>document.querySelector(s);let active=null,serial=0;const dirty=new Set();
 const current=()=>['inspection','inspectionHistory'].includes(view());
 const permitted=()=>active?.value.createdBy===user()?.id&&!!active?.value.workspace.draft;
 function safe(g,s){return g===epoch()&&s===serial&&current();}
 function error(e){message(e.message+'；未确认保存的内容不会自动上传。',true);}
 function canLeave(){if(!dirty.size)return true;message('请先保存各项修改，或明确放弃未保存内容后重新读取。',true);return false;}
 function reset(){serial++;active=null;dirty.clear();}
 async function list(kind,after){
  if(!user())return;const g=epoch(),s=++serial;active=null;dirty.clear();pager(null);
  const q=new URLSearchParams({status:kind==='inspection'?'draft':'submitted',limit:'20'});
  if($('#searchInput').value.trim())q.set('q',$('#searchInput').value.trim());if(after)q.set('cursor',after);
  try{
   const result=await api('/api/inspections?'+q);if(!safe(g,s)||view()!==kind)return;
   $('#viewTitle').textContent=kind==='inspection'?'巡检草稿':'巡检记录';$('#viewEyebrow').textContent='SERVER INSPECTIONS';
   $('#stats').textContent='当前页 '+result.items.length+' 条巡检（不是全单位统计）';
   const start=kind==='inspection'&&['admin','manager','inspector'].includes(user().role)?'<form id="serverInspectionStart"><label>巡检地点<input name="location" required maxlength="120"></label><button class="primary">开始巡检</button></form>':'';
   $('#list').innerHTML=start+result.items.map(x=>'<article class="card"><h4>'+esc(x.location)+'</h4><p>'+esc(x.status==='draft'?'草稿':'已提交')+' · 已检查 '+x.checked+'/'+x.total+' · 问题 '+x.issues+'</p><button class="ghost" data-open-inspection="'+esc(x.id)+'">查看 / 继续检查</button></article>').join('')+(result.items.length?'':'<p>当前范围没有巡检记录。</p>');
   pager(result.nextCursor);
  }catch(e){if(safe(g,s)){$('#list').replaceChildren();$('#stats').textContent='读取未完成';error(e);}}
 }
 function render(d){
  active=d;dirty.clear();pager(null);const x=d.value,record=x.workspace.draft||x.workspace.records[0],editable=permitted();
  $('#viewTitle').textContent=record.location;$('#viewEyebrow').textContent='INSPECTION SNAPSHOT';
  $('#stats').textContent='已检查 '+record.items.filter(x=>x.result!=='pending').length+'/'+record.items.length+' · 模板版本 '+record.templateVersion;
  const options=[['pending','未检查'],['pass','合格'],['issue','发现问题'],['na','不适用']];
  const items=record.items.map(item=>editable?'<form class="check-item" data-server-inspection-item="'+esc(item.id)+'"><h4>'+esc(item.category)+' · '+esc(item.name)+'</h4><label>结果<select name="result">'+options.map(([v,t])=>'<option value="'+v+'"'+(item.result===v?' selected':'')+'>'+t+'</option>').join('')+'</select></label><label>说明<textarea name="note" maxlength="240">'+esc(item.note)+'</textarea></label><label>替换本项照片<input name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple></label><p data-photo-count>已保存照片 '+item.photos.length+' 张；不选择新照片会保留原图。</p><label><input name="removePhotos" type="checkbox">明确移除本项已保存照片</label><button class="primary">保存本项</button><p data-item-status role="status"></p></form>':'<article class="check-item"><h4>'+esc(item.category)+' · '+esc(item.name)+'</h4><p>'+esc(options.find(([v])=>v===item.result)?.[1])+' · '+esc(item.note)+'</p><p>照片 '+item.photos.length+' 张</p></article>').join('');
  $('#list').innerHTML='<p>沿用原 V1 工作清单快照，非法规核验。每项单独保存；提交会原子生成问题记录。</p><button class="ghost" data-inspection-reload>放弃本页未保存修改并重新读取</button>'+items+(editable?'<form id="serverInspectionCustom"><label>自定义检查项<input name="name" required maxlength="200"></label><label>分类<input name="category" required maxlength="60"></label><button class="ghost">添加自定义项</button></form><button id="serverInspectionSubmit" class="primary">完成巡检并提交问题</button>':'<h4>关联问题</h4>'+(record.reportIds||[]).map(id=>'<p><button class="ghost" data-server-detail="'+esc(id)+'">'+esc(id)+'</button></p>').join(''));
  $('#searchInput').disabled=true;
 }
 async function open(id){
  const g=epoch(),s=++serial;pager(null);
  try{const d=await api('/api/inspections/'+encodeURIComponent(id));if(safe(g,s))render(d);}catch(e){if(safe(g,s))error(e);}
 }
 document.addEventListener('input',e=>{
  const form=e.target.closest('[data-server-inspection-item]');if(form&&active){dirty.add(form.dataset.serverInspectionItem);form.querySelector('[data-item-status]').textContent='尚未保存';}
 });
 document.addEventListener('click',async e=>{
  const openButton=e.target.closest('[data-open-inspection]'),reload=e.target.closest('[data-inspection-reload]');
  if(openButton){if(canLeave())await open(openButton.dataset.openInspection);return;}
  if(reload&&active){dirty.clear();await open(active.id);return;}
  if(e.target.id==='serverInspectionSubmit'&&active&&permitted()){
   if(!canLeave())return;const d=active,g=epoch();e.target.disabled=true;
   try{const result=await api('/api/inspections/'+encodeURIComponent(d.id)+'/submit',{body:{expectedRevision:d.revision}});if(g!==epoch()||active!==d)return;render(result);message('巡检已提交，生成 '+result.reportIds.length+' 条关联问题。');}
   catch(e){error(e);}finally{if(e.target.isConnected)e.target.disabled=false;}
  }
 });
 document.addEventListener('submit',async e=>{
  const form=e.target;
  if(form.id==='serverInspectionStart'){
   e.preventDefault();const g=epoch(),kind=view(),button=form.querySelector('button');button.disabled=true;
   try{const result=await api('/api/inspections',{body:{location:form.elements.location.value}});if(g===epoch()&&kind===view()&&current())render(result);}catch(e){error(e);}finally{button.disabled=false;}return;
  }
  if(form.id==='serverInspectionCustom'&&active&&permitted()){
   e.preventDefault();if(!canLeave())return;const d=active,g=epoch(),button=form.querySelector('button');button.disabled=true;
   try{const result=await api('/api/inspections/'+encodeURIComponent(d.id)+'/custom',{body:{expectedRevision:d.revision,input:{name:form.elements.name.value,category:form.elements.category.value}}});if(g===epoch()&&active===d)render(result);}catch(e){error(e);}finally{button.disabled=false;}return;
  }
  if(!form.matches('[data-server-inspection-item]')||!active||!permitted())return;
  e.preventDefault();const d=active,g=epoch(),id=form.dataset.serverInspectionItem,item=d.value.workspace.draft.items.find(x=>x.id===id),controls=[...form.elements];
  controls.forEach(x=>x.disabled=true);
  try{
   const imageList=form.elements.removePhotos.checked?[]:form.elements.photos.files.length?await photos(form.elements.photos):item.photos;
   const input={itemId:id,result:form.elements.result.value,note:form.elements.note.value,photos:imageList};
   if(g!==epoch()||active!==d)throw Error('账号或巡检已改变，请重新读取');
   const result=await api('/api/inspections/'+encodeURIComponent(d.id)+'/items',{body:{expectedRevision:d.revision,input}});
   if(g!==epoch()||active!==d)return;
   // Keep unrelated unsaved forms intact; only adopt the saved document/revision.
   active.revision=result.revision;active.value=result.value;dirty.delete(id);
   form.elements.photos.value='';form.elements.removePhotos.checked=false;
   form.querySelector('[data-photo-count]').textContent='已保存照片 '+imageList.length+' 张；不选择新照片会保留原图。';
   form.querySelector('[data-item-status]').textContent='已保存至测试服务';
   $('#stats').textContent='已检查 '+active.value.workspace.draft.items.filter(x=>x.result!=='pending').length+'/'+active.value.workspace.draft.items.length;
  }catch(e){form.querySelector('[data-item-status]').textContent=e.message+'；输入仍保留，版本冲突需重新读取。';}
  finally{controls.forEach(x=>x.disabled=false);}
 });
 return {list,open,reset,canLeave};
};
