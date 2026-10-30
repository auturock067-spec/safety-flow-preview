'use strict';
const C = SafetyCore, I = SafetyInspections, KEY = 'sf-web-v2', $ = s => document.querySelector(s);
let items = [], workspace = I.empty(), raw = null, locked = false, view = 'reports', pending = null;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = v => v ? new Date(v).toLocaleString('zh-CN', { hour12: false }) : '旧版时间未核实';
const actor = () => C.actors[$('#actorInput').value];
function message(s, error = false) { $('#message').textContent = s; $('#message').className = error ? 'message error' : 'message'; }
try {
  raw = localStorage.getItem(KEY);
  if (raw !== null) { items = C.decode(raw); workspace = I.validate(JSON.parse(raw).workspace ?? I.empty(), items); }
  else {
    const legacy = localStorage.getItem('sf-preview');
    if (legacy !== null) {
      items = C.migrate(legacy);
      message('已读取旧版本机记录；原始 sf-preview 未改动。相对日期无法核实，旧图片标记不等于真实证据。');
    }
  }
} catch (e) { locked = true; message('本地数据无法读取，已停止写入以保护原数据。请先导出原始备份。' + e.message, true); }
async function commit(next, nextWorkspace = workspace, restoring = false) {
  if (locked && !restoring) throw new Error('本地数据异常，写入已锁定');
  if (!navigator.locks?.request) throw new Error('当前浏览器不支持安全本地写入，请使用支持 Web Locks 的现代浏览器；表单尚未保存。');
  const expected = raw;
  const validatedWorkspace = I.validate(nextWorkspace, next);
  return navigator.locks.request('safety-flow:' + KEY, { mode: 'exclusive' }, () => {
    if (locked && !restoring) throw new Error('数据已在其他标签页更新，请刷新后重试');
    try { raw = C.persist(localStorage, KEY, next, expected, validatedWorkspace); }
    catch (e) { throw new Error('保存失败，未变更记录，请保留表单并导出备份。' + e.message); }
    items = next; workspace = validatedWorkspace; locked = false; render(); message('已保存到本机浏览器；未上传云端。');
  });
}
const stageLabels = { report: '待确认', action: '整改中', verify: '待验收', closed: '已关闭' };
const labels = { reports:['TRIAGE','待确认'], actions:['ACTION','我的整改'], verify:['VERIFICATION','待我验收'], overdue:['OVERDUE','已超期'], ledger:['LEDGER','台账'], inspection:['INSPECTION','巡检与草稿'], inspectionHistory:['HISTORY','巡检记录'], templates:['TEMPLATES','检查模板'], monthly:['MONTHLY REPORT','月报'] };
function filtered() {
  const q = $('#searchInput').value.trim().toLowerCase(), stage = $('#stageInput').value;
  return items.filter(x =>
    (view === 'reports' ? x.stage === 'report' : view === 'actions' ? x.stage === 'action' : view === 'verify' ? x.stage === 'verify' : view === 'overdue' ? C.overdue(x) : true) &&
    (!stage || x.stage === stage) && [x.id,x.location,x.desc,x.assignee||'',globalThis.SafetyI18n?.t(x.location)||'',globalThis.SafetyI18n?.t(x.assignee||'')||''].join(' ').toLowerCase().includes(q));
}
function buttons(x) {
  const role = actor().role;
  let html = '';
  if (!locked && x.stage === 'report' && role === 'manager') html += '<button class="primary" data-action="assign">确认并分派</button>';
  if (!locked && x.stage === 'action' && role === 'worker' && x.assignee === actor().name) html += '<button class="primary" data-action="rectify">提交整改</button>';
  if (!locked && x.stage === 'verify' && role === 'reviewer') html += '<button class="success" data-action="approve">验收通过</button><button class="danger" data-action="reject">退回</button>';
  return html + '<button class="ghost" data-action="detail">详情</button>';
}
function render() {
  const extra=["inspection","inspectionHistory","templates","monthly"].includes(view);
  $("#exportCsv").disabled=extra; $("#stageInput").disabled=extra;
  $("#searchInput").disabled=["inspection","templates","monthly"].includes(view);
  $('#stats').innerHTML = Object.entries(stageLabels).map(([s,label]) => '<div class="stat"><strong>' + items.filter(x=>x.stage===s).length + '</strong><span>' + label + '</span></div>').join('');
  for (const [id,s] of [['Reports','report'],['Actions','action'],['Verify','verify']]) $('#badge'+id).textContent = items.filter(x=>x.stage===s).length || '';
  $('#badgeOverdue').textContent = items.filter(x=>C.overdue(x)).length || '';
  $('#viewEyebrow').textContent = labels[view][0]; $('#viewTitle').textContent = labels[view][1];
  if (['inspection','inspectionHistory','templates','monthly'].includes(view)) { renderInspection(); return; }
  $('#list').innerHTML = filtered().map(x => '<article class="card" data-id="' + esc(x.id) + '"><div><div><span class="tag">' + stageLabels[x.stage] + '</span>' + (C.overdue(x)?'<span class="tag danger">超期</span>':'') + '</div><h4>' + esc(x.desc) + '</h4><div class="meta"><span>' + esc(x.id) + '</span><span>地点：' + esc(x.location) + '</span><span>创建：' + esc(fmt(x.createdAt)) + '</span>' + (x.assignee?'<span>责任：'+esc(x.assignee)+'</span>':'') + (x.due?'<span>截止：'+esc(fmt(x.due))+'</span>':'') + '</div></div><div class="card-actions">' + buttons(x) + '</div></article>').join('') || '<div class="empty"><span class="empty-symbol" aria-hidden="true">✓</span><h4>当前没有匹配事项</h4><p>调整筛选条件，或记录一项现场问题。</p></div>';
}
function photosHtml(photos) {
  return photos.map(p=>'<figure><a href="' + esc(p.data) + '" target="_blank" rel="noopener"><img alt="' + esc(p.name) + '" src="' + esc(p.data) + '"></a><figcaption>' + esc(p.name) + '</figcaption></figure>').join('') || '<p>无真实图片</p>';
}
function detail(x) {
  $('#detailContent').innerHTML = '<div class="dialog-head"><div><div class="eyebrow">' + esc(x.id) + '</div><h3>' + esc(x.desc) + '</h3></div><button class="icon-btn" aria-label="关闭详情" data-close="detailDialog">×</button></div><p>地点：' + esc(x.location) + ' · ' + stageLabels[x.stage] + '</p>' + (x.inspection?'<p>来源巡检：'+esc(x.inspection.id)+' · '+esc(x.inspection.category)+'（模板工作清单，非法规判定）</p>':'') + '<p>责任组：' + esc(x.assignee || '未分派') + ' · 截止：' + (x.due?esc(fmt(x.due)):'未设定') + '</p>' + (x.legacyDue?'<p>旧版期限原文：'+esc(x.legacyDue)+'（未核实，不用于逾期判断）</p>':'') + '<h4>现场图片</h4><div class="photos">' + photosHtml(x.reportEvidence) + '</div><h4>最新整改图片</h4><div class="photos">' + photosHtml(x.rectificationEvidence) + '</div><div class="timeline">' + x.history.map(h=>'<div class="event"><strong>'+esc(h.action)+'</strong><span>'+esc(h.actor)+' · '+esc(fmt(h.at))+'</span><p>'+esc(h.note)+'</p>'+(h.assignee?'<p>责任：'+esc(h.assignee)+' · 截止：'+esc(fmt(h.due))+'</p>':'')+(h.photos?'<div class="photos">'+photosHtml(h.photos)+'</div>':'')+'</div>').join('')+'</div>';
  $('#detailDialog').showModal();
}
function openAction(x, action) {
  pending = {id:x.id, action}; $('#actionForm').reset(); $('#actionError').textContent = '';
  $('#actionTitle').textContent = {assign:'确认并分派',rectify:'提交整改',approve:'验收通过',reject:'退回整改'}[action];
  $('#assignFields').hidden = action !== 'assign';
  $('#actionDue').required = action === 'assign';
  $('#actionNote').required = action !== 'assign';
  $('#actionPhotoLabel').hidden = action !== 'rectify';
  $('#actionPhotos').required = action === 'rectify';
  if (action === 'assign') { const d = new Date(Date.now()+86400000); $('#actionDue').value = new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16); }
  $('#actionDialog').showModal();
}
async function readPhotos(input) {
  const files = [...input.files]; if(files.length>3) throw new Error('每次最多 3 张图片');
  return Promise.all(files.map(async file=>{
    if(!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>1048576) throw new Error('图片须为 PNG/JPEG/WebP，单张不超过 1MB');
    const data = await new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=()=>reject(new Error('读取图片失败，请重试')); r.readAsDataURL(file); });
    const image = new Image(); image.src=data; await image.decode().catch(()=>{throw new Error('图片内容无法解码，请选择有效图片');});
    return {name:file.name, data};
  }));
}
document.addEventListener('click', e=>{
  const close=e.target.closest('[data-close]'); if(close){ $('#'+close.dataset.close).close(); return; }
  const b=e.target.closest('[data-action]'); if(!b)return;
  const x=items.find(i=>i.id===b.closest('[data-id]').dataset.id);
  if(b.dataset.action==='detail')detail(x); else openAction(x,b.dataset.action);
});
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));
  view=b.dataset.view; render();
}));
for(const id of ['searchInput','stageInput','actorInput']) $('#'+id).addEventListener('input',render);
$('#actorInput').addEventListener('change',()=>{ if($('#actionDialog').open) $('#actionDialog').close(); pending=null; render(); });
$('#newReportBtn').onclick=()=>{ if(locked){message('数据异常，请先导出原始备份',true);return;} $('#reportError').textContent=''; $('#reportDialog').showModal(); };
$('#reportForm').addEventListener('submit',async e=>{
  e.preventDefault(); const submit=$('#submitReport'); submit.disabled=true;
  const currentActor=actor();
  try {
    const input={location:$('#locationInput').value,desc:$('#descInput').value,photos:await readPhotos($('#photoInput'))};
    await commit([C.report(input,currentActor),...items]); $('#reportForm').reset(); $('#reportDialog').close();
  } catch(e){$('#reportError').textContent=e.message;}
  finally{submit.disabled=false;}
});
$('#actionForm').addEventListener('submit',async e=>{
  e.preventDefault(); const b=$('#submitAction'); b.disabled=true; const p={...pending}, currentActor=actor();
  try {
    const x=items.find(i=>i.id===p.id);
    const input={assignee:$('#actionAssignee').value,due:$('#actionDue').value,note:$('#actionNote').value,photos:p.action==='rectify'?await readPhotos($('#actionPhotos')):[]};
    const next=C.transition(x,p.action,input,currentActor);
    await commit(items.map(i=>i.id===p.id?next:i)); $('#actionDialog').close();
  } catch(e){$('#actionError').textContent=e.message;}
  finally{b.disabled=false;}
});
function download(name, data, type) {
  const url=URL.createObjectURL(new Blob([data],{type})), a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('#exportCsv').onclick=()=>download('safety-flow-test-ledger.csv',C.csv(filtered(),globalThis.SafetyI18n?.language||'zh'),'text/csv;charset=utf-8');
$('#exportJson').onclick=()=>{
  try { download('safety-flow-local-backup.json',locked?JSON.stringify({unreadable:localStorage.getItem(KEY),legacy:localStorage.getItem('sf-preview')}):C.serialize(items,workspace),'application/json'); }
  catch(e){message('无法访问本地存储：'+e.message,true);}
};
$('#resetBtn').onclick=async()=>{
  if(locked){message('数据异常，禁止覆盖。请先导出原始备份。',true);return;}
  if(!confirm('载入演示会替换当前本机测试记录。请先导出备份。是否继续？'))return;
  try {
    const at=new Date().toISOString(), manager=C.actors.manager;
    const a=C.report({location:'地下车库',desc:'【演示】消防通道堆放纸箱'},C.actors.inspector,at,'DEMO-001');
    let b=C.report({location:'3#配电房',desc:'【演示】配电柜前堆放维修材料'},C.actors.inspector,at,'DEMO-002');
    b=C.transition(b,'assign',{assignee:C.actors.worker.name,due:new Date(Date.now()+86400000).toISOString()},manager);
    // Legacy demo records are preserved through migration; new examples never fake evidence.
    await commit([a,b],I.empty());
  }catch(e){message(e.message,true);}
};
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){locked=true;message('其他标签页已更新本地存储，请刷新以读取最新记录。当前页面写入已锁定。',true);render();}});
render();
