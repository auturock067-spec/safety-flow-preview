(function(root){
  'use strict';
  // Checklist content recovered from original V1 utils/template-service.js.
  // Local working checklist only: no regulatory or legal classification claim.
  const DEFAULTS=[
    {id:'fire',name:'消防',items:['消防通道保持畅通','灭火器在有效期内','消防设施完好可用','安全出口标识完好']},
    {id:'utilities',name:'水电',items:['配电箱无积尘和遮挡','电线电缆无破损','用水设施无跑冒滴漏','开关及插座固定完好']},
    {id:'equipment',name:'设备',items:['设备运行无异常','防护装置完整有效','设备标识清晰','维护保养记录完整']},
    {id:'building',name:'建筑',items:['墙体及地面无明显破损','门窗及护栏牢固','疏散通道无障碍物','高处物品无坠落风险']},
    {id:'other',name:'其他',items:['作业环境整洁','警示标识设置合理','个人防护用品使用规范']}
  ];
  const clone=x=>structuredClone(x),ok=(v,m)=>{if(!v)throw Error(m);};
  const text=(x,max=200)=>{ok(typeof x==='string'&&x.trim().length>0&&x.trim().length<=max,'请填写有效内容（最多'+max+'字）');return x.trim();};
  const date=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
  const role=(actor,roles)=>ok(actor&&roles.includes(actor.role),'当前测试身份不能执行此操作');
  const id=prefix=>prefix+'-'+crypto.randomUUID();
  function empty(){return {version:1,templateVersion:1,templates:clone(DEFAULTS),draft:null,records:[]};}
  function validateTemplates(templates){
    ok(Array.isArray(templates)&&templates.length>0&&templates.length<=30,'模板分类无效');const ids=new Set();
    for(const t of templates){text(t.id,100);text(t.name,60);ok(!ids.has(t.id),'模板分类编号重复');ids.add(t.id);ok(Array.isArray(t.items)&&t.items.length>0&&t.items.length<=100,'每类须有1至100个检查项');for(const s of t.items)text(s);ok(new Set(t.items).size===t.items.length,'检查项重复');}
  }
  function counts(items){return {total:items.length,checked:items.filter(x=>x.result!=='pending').length,pass:items.filter(x=>x.result==='pass').length,issue:items.filter(x=>x.result==='issue').length,na:items.filter(x=>x.result==='na').length};}
  function validateInspection(d,complete=false){
    text(d.id,100);text(d.location,120);ok(date(d.startedAt)&&Number.isSafeInteger(d.templateVersion)&&d.templateVersion>0,'巡检时间或版本无效');
    ok(d.snapshot&&d.snapshot.source==='Safety Flow local V1 checklist'&&d.snapshot.version===d.templateVersion&&d.snapshot.verifiedAt===null,'模板来源快照无效');validateTemplates(d.snapshot.templates);
    ok(Array.isArray(d.items)&&d.items.length>0&&d.items.length<=3000,'巡检项无效');const ids=new Set();
    for(const x of d.items){text(x.id,120);text(x.name);text(x.category,60);ok(!ids.has(x.id)&&['pending','pass','issue','na'].includes(x.result),'检查项编号或结果无效');ids.add(x.id);ok(typeof x.note==='string'&&x.note.length<=240,'问题说明最多240字');ok(Array.isArray(x.photos)&&x.photos.length<=3,'检查照片无效');for(const p of x.photos)ok(p&&typeof p.name==='string'&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(p.data)&&p.data.length<=1400000,'检查照片无效');if(complete){ok(x.result!=='pending','请完成全部检查项');if(x.result==='issue')text(x.note,240);}}
    const originals=d.snapshot.templates.flatMap(t=>t.items.map((name,i)=>({id:t.id+'-'+i,name,category:t.name})));ok(originals.every(x=>d.items.some(y=>x.id===y.id&&x.name===y.name&&x.category===y.category))&&d.items.every(x=>x.custom===true||originals.some(y=>y.id===x.id&&y.name===x.name&&y.category===x.category)),'检查项与模板快照不一致');
    if(complete)ok(date(d.completedAt)&&Date.parse(d.completedAt)>=Date.parse(d.startedAt),'巡检完成时间无效');
  }
  function validate(state,reports){
    ok(state&&state.version===1&&Number.isSafeInteger(state.templateVersion)&&state.templateVersion>0,'巡检数据版本无效');validateTemplates(state.templates);ok(Array.isArray(state.records)&&state.records.length<=10000,'巡检历史无效');
    const ids=new Set();for(const r of state.records){validateInspection(r,true);ok(!ids.has(r.id),'巡检编号重复');ids.add(r.id);ok(Array.isArray(r.reportIds)&&r.reportIds.length===counts(r.items).issue&&new Set(r.reportIds).size===r.reportIds.length,'巡检问题关联无效');
      if(reports){const linked=reports.filter(x=>x.inspection?.id===r.id);ok(linked.length===r.reportIds.length&&r.reportIds.every(id=>linked.some(x=>x.id===id)),'巡检关联的问题记录缺失');ok(new Set(linked.map(x=>x.inspection.itemId)).size===linked.length,'检查项重复关联问题');for(const x of linked){const item=r.items.find(i=>i.id===x.inspection.itemId);ok(item?.result==='issue'&&x.location===r.location&&x.inspection.category===item.category,'巡检问题来源不一致');}}
    }
    if(state.draft){validateInspection(state.draft);ok(!ids.has(state.draft.id),'已提交的巡检不能再次作为草稿');}
    if(reports)for(const x of reports)if(x.inspection)ok(state.records.some(r=>r.id===x.inspection.id&&r.reportIds.includes(x.id)),'问题引用不存在的巡检');return clone(state);
  }
  function setTemplate(state,actor,categoryId,name,lines){
    role(actor,['manager']);const next=validate(state);const items=[...new Set(lines.map(x=>String(x).trim()).filter(Boolean))];const t={id:categoryId||id('category'),name:text(name,60),items};const index=next.templates.findIndex(x=>x.id===t.id);if(index<0)next.templates.push(t);else next.templates[index]=t;next.templateVersion++;return validate(next);
  }
  function start(state,actor,location,at=new Date().toISOString()){
    role(actor,['inspector','manager']);const next=validate(state);ok(!next.draft,'已有草稿，请先继续或明确放弃');
    next.draft={id:id('IN'),location:text(location,120),startedAt:at,templateVersion:next.templateVersion,snapshot:{source:'Safety Flow local V1 checklist',version:next.templateVersion,verifiedAt:null,templates:clone(next.templates)},items:next.templates.flatMap(t=>t.items.map((name,i)=>({id:t.id+'-'+i,name,category:t.name,result:'pending',note:'',photos:[]})))};return validate(next);
  }
  function custom(state,actor,name,category){role(actor,['inspector','manager']);const next=validate(state);ok(next.draft,'请先开始巡检');const value=text(name);ok(!next.draft.items.some(x=>x.name===value&&x.category===category),'已有相同检查项');next.draft.items.push({id:id('custom'),name:value,category:text(category,60),result:'pending',note:'',photos:[],custom:true});return validate(next);}
  function submit(state,actor,makeReport,at=new Date().toISOString()){
    role(actor,['inspector','manager']);const next=validate(state);ok(next.draft,'没有可提交的巡检草稿');const record=clone(next.draft);record.completedAt=at;validateInspection(record,true);const reports=record.items.filter(x=>x.result==='issue').map(x=>makeReport({location:record.location,desc:x.name+'：'+x.note,photos:x.photos},actor,at,'SF-'+record.id+'-'+x.id));
    reports.forEach((report,i)=>{const issue=record.items.filter(x=>x.result==='issue')[i];report.inspection={id:record.id,itemId:issue.id,category:issue.category};report.safetyPackSnapshot=clone(record.snapshot);});record.reportIds=reports.map(x=>x.id);next.records.unshift(record);next.draft=null;validate(next);return {workspace:next,reports,record};
  }
  function monthly(reports,records,month,now=Date.now()){
    ok(/^\d{4}-(0[1-9]|1[0-2])$/.test(month),'请选择有效月份');const [year,m]=month.split('-').map(Number);ok(year>=2000&&year<=9999,'月份超出支持范围');const start=new Date(year,m-1,1).getTime(),end=new Date(year,m,1).getTime();const within=x=>date(x)&&Date.parse(x)>=start&&Date.parse(x)<end;const rows=reports.filter(x=>within(x.createdAt));const closed=rows.filter(x=>x.stage==='closed').length;const groups=new Map();for(const x of rows){const category=x.inspection?.category||'未分类';groups.set(category,(groups.get(category)||0)+1);}return {month,total:rows.length,closed,open:rows.length-closed,overdue:rows.filter(x=>x.stage!=='closed'&&date(x.due)&&Date.parse(x.due)<now).length,closureRate:rows.length?Math.round(closed/rows.length*100):0,inspections:records.filter(x=>within(x.completedAt)).length,unknownDates:reports.filter(x=>!date(x.createdAt)).length,categories:[...groups].map(([name,count])=>({name,count})),rows};
  }
  const api={empty,validate,counts,setTemplate,start,custom,submit,monthly};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SafetyInspections=api;
})(typeof globalThis!=='undefined'?globalThis:this);
