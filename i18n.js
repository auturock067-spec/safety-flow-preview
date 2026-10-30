(function(root){
'use strict';
const dictionary={
'事项状态概览':'Issue status overview','测试身份与台账工具':'Simulated role and ledger tools','工作导航':'Workspace navigation','安巡记':'Safety Flow','安全巡检 · 隐患整改':'Safety inspections · Corrective actions','试用空间':'Trial workspace','账号预览':'Account preview','演示数据':'Demo data',
'本机试用':'Local trial','数据仅保存在当前浏览器，身份为流程模拟，无共享同步或单位隔离。请使用测试资料，本地历史可被修改。':'Data stays in this browser. Roles are simulated; there is no shared sync or organization isolation. Use dummy data only. Local history is editable.',
'安全工作台':'Safety workspace','每一项隐患，都有回音。':'Find it. Fix it. Follow through.','记录现场问题，明确责任，跟进整改与独立复核。':'Report issues, assign responsibility, track fixes and review the evidence.','＋ 上报问题':'+ Report an issue',
'待确认':'To confirm','整改中':'In progress','待验收':'Awaiting review','已关闭':'Closed','测试身份':'Simulated role','巡查人员':'Inspector','安全管理员':'Safety manager','现场责任组':'Assigned team','复核人员':'Reviewer',
'搜索':'Search','编号、地点、描述、责任组':'ID, location, description or team','状态筛选':'Status','全部状态':'All statuses','导出当前筛选台账 CSV':'Export filtered CSV','导出完整本机备份':'Back up local data',
'工作队列':'Work queue','我的整改':'My actions','待我验收':'Review queue','已超期':'Overdue','台账':'Ledger','巡检与记录':'Inspections & records','巡检与草稿':'Inspections & drafts','巡检记录':'Inspection history','检查模板':'Checklists','月报':'Monthly report',
'发现 · 分派 · 整改 · 验收':'Report · Assign · Fix · Review','当前没有匹配事项':'No matching records','调整筛选条件，或记录一项现场问题。':'Change your filters or report an issue.','试用范围':'Trial scope',
'极简上报、整改验收、巡检草稿、检查模板、巡检历史、月报和本机备份恢复。模板非法规核验；真实登录、单位隔离和外部任务授权尚未实现。':'Try reporting, corrective actions, inspection drafts, checklists, history, monthly reports and local backup recovery. Checklists are not legally verified. This local mode has no real sign-in, organization isolation or external task access.',
'现场问题记录':'FIELD ISSUE','发现问题':'Report an issue','关闭':'Close','地点':'Location','创建':'Created','责任':'Assigned','截止':'Due','请选择':'Select a location','3#配电房':'Electrical room 3','地下车库':'Underground garage','消防通道':'Fire exit route','设备机房':'Plant room','员工食堂':'Staff cafeteria',
'问题描述':'Issue description','例如：消防通道堆放纸箱，影响通行':'Example: boxes are blocking the fire exit route.','现场证据':'Site evidence','可选，最多 3 张，每张不超过 1MB。图片实际保存在本机浏览器，清除浏览器数据会丢失。':'Optional: up to 3 images, 1MB each. Images stay in this browser and are lost if its data is cleared.',
'取消':'Cancel','提交问题':'Submit issue','关闭操作':'Close action','责任组':'Assigned team','整改截止时间':'Due date','处理说明':'Action notes','整改措施、验收意见或退回原因':'Describe the fix, review decision or reason for returning it.','整改图片':'Rectification images','至少一张有效图片，最多 3 张，单张不超过 1MB。':'At least one valid image; up to 3 images, 1MB each.','保存操作':'Save action','恢复本机测试备份（将确认替换当前记录）':'Restore local trial backup (confirmation required)',
'详情':'Details','关闭详情':'Close details','确认并分派':'Confirm & assign','提交整改':'Submit fix','验收通过':'Approve','退回':'Return','退回整改':'Return for correction','超期':'Overdue','未分派':'Unassigned','未设定':'Not set','无真实图片':'No image evidence','现场图片':'Site images','最新整改图片':'Latest rectification images',
'使用当前模板开始巡检，问题项提交后进入待确认队列。':'Start with the current checklist. Submitted issues enter the confirmation queue.','巡检地点':'Inspection location','开始巡检':'Start inspection',
'消防':'Fire safety','水电':'Utilities','设备':'Equipment','建筑':'Building','其他':'Other',
'消防通道保持畅通':'Fire exit routes are clear','灭火器在有效期内':'Fire extinguishers are within their service date','消防设施完好可用':'Fire protection equipment is serviceable','安全出口标识完好':'Exit signs are intact',
'配电箱无积尘和遮挡':'Electrical panels are free of dust and obstruction','电线电缆无破损':'Wires and cables are undamaged','用水设施无跑冒滴漏':'Water systems have no visible leaks','开关及插座固定完好':'Switches and sockets are securely fixed',
'设备运行无异常':'Equipment operates normally','防护装置完整有效':'Guards and protective devices are intact','设备标识清晰':'Equipment labels are legible','维护保养记录完整':'Maintenance records are complete',
'墙体及地面无明显破损':'Walls and floors have no obvious damage','门窗及护栏牢固':'Doors, windows and guardrails are secure','疏散通道无障碍物':'Evacuation routes are unobstructed','高处物品无坠落风险':'Overhead items are secured against falling',
'作业环境整洁':'Work areas are tidy','警示标识设置合理':'Warning signs are appropriately placed','个人防护用品使用规范':'Personal protective equipment is used correctly',
'检查结果':'Result','未检查':'Not checked','符合':'Pass','问题':'Issue','不适用':'Not applicable','问题说明（问题项必填）':'Issue notes (required for issues)','现场照片（选填，最多3张）':'Site images (optional, up to 3)',
'保存草稿':'Save draft','提交巡检并生成问题':'Submit inspection & create issues','临时补充检查项':'Add a custom check','分类':'Category','检查内容':'Check description','保存草稿并添加检查项':'Save draft & add check','放弃本机草稿':'Discard local draft',
'编辑分类':'Edit category','新增分类':'New category','分类名称':'Category name','检查内容，每行一项':'One check per line','保存模板（模拟管理员）':'Save checklist (simulated manager)','查看当时检查项与关联问题':'View saved checks and linked issues',
'统计月份':'Report month','按设备当地日历月统计本月新上报问题，关闭率按这些问题当前状态计算；巡检次数按提交月份统计。':'Uses this device’s calendar month. Closure rate uses the current status of issues reported in that month; inspections use their submission month.',
'本月新问题':'New issues','其中已关闭':'Closed in this cohort','其中已逾期':'Overdue in this cohort','本月巡检':'Inspections submitted','导出本月问题台账 CSV':'Export this month’s issue CSV',
'已保存到本机浏览器；未上传云端。':'Saved in this browser. Nothing was uploaded.','当前测试身份不能提交巡检':'This simulated role cannot submit inspections.','当前测试身份不能放弃草稿':'This simulated role cannot discard this draft.',
'每次最多 3 张图片':'Up to 3 images per action.','图片须为 PNG/JPEG/WebP，单张不超过 1MB':'Use PNG/JPEG/WebP images, up to 1MB each.','读取图片失败，请重试':'Could not read the image. Please try again.','图片内容无法解码，请选择有效图片':'This image could not be decoded. Choose a valid image.',
'载入演示会替换当前本机测试记录。请先导出备份。是否继续？':'Replace this browser’s trial records with demo data? Back up your current records first.',
'放弃已保存的本机巡检草稿？已提交记录不会改变。':'Discard the saved local inspection draft? Submitted records will not change.',
'【演示】消防通道堆放纸箱':'[Demo] Boxes obstruct the fire exit route','【演示】配电柜前堆放维修材料':'[Demo] Maintenance supplies in front of the switchboard',
'数据异常，请先导出原始备份':'Local data is unreadable. Export a raw backup first.','本地数据异常，写入已锁定':'Local data is unreadable; writing is locked.','数据已在其他标签页更新，请刷新后重试':'Another tab changed the data. Reload before trying again.',
'其他标签页已更新本地存储，请刷新以读取最新记录。当前页面写入已锁定。':'Another tab updated local data. Reload to read it; writes are locked on this page.',
'当前浏览器不支持安全本地写入，请使用支持 Web Locks 的现代浏览器；表单尚未保存。':'Safe local writes need a browser with Web Locks support. Your form has not been saved.',
'备份不能超过25MB':'Backups must be 25MB or smaller.','只支持明确标记的本机测试备份':'Only explicitly marked local-trial backups are supported.','已从备份恢复到本机，未上传云端。':'Restored to this browser; nothing was uploaded.',
'账号联调模式 · 未完成正式验收':'Account preview · Not accepted for production','仅连接当前站点真实接口；不会读取或上传本机测试记录。巡检能力按服务配置启用；模板管理、月报及完整备份尚未接入此模式。':'Connects only to this site’s real API. Local trial records are not read or uploaded. Inspection access depends on server capabilities; shared templates, monthly reports and full backups remain unfinished.',
'返回本机测试模式':'Return to local trial','巡查人员上报，安全管理人员确认并分派，责任人整改，由独立复核人员验收。':'Inspectors report, managers confirm and assign, owners correct, and independent reviewers approve.',
'地点、问题描述':'Location or issue description','导出全部匹配台账 CSV':'Export all matching records','账号模式仍在联调，当前范围为问题整改及已配置的巡检服务。不能作为正式验收通过的版本。':'Account mode is under integration testing. Report/action flows and configured inspection services do not constitute production acceptance.',
'可选，最多3张、单张不超过1MB；提交成功后保存至当前测试服务。':'Optional: up to 3 images, 1MB each. A successful submission stores them in the current test service.',
'账号':'Account','密码':'Password','登录测试服务':'Sign in to test service','退出账号':'Sign out','下一页':'Next page','隐患分类':'Hazard category','风险等级':'Risk level','例如：消防':'Example: fire safety','由安全管理人员独立评估':'Assessed separately by the safety manager',
'此功能尚未连接账号服务；本机模式仍可测试':'Not connected to the account service yet; available in local trial mode.',
'请登录测试账号':'Sign in with a configured test account.','账号模式需要 HTTPS 连接；当前页面不能登录，请返回本机测试模式':'Account mode requires HTTPS. Sign-in is disabled here; return to the local trial.',
'当前站点未配置可用的账号接口':'No usable account API is configured on this site.','接口请求失败':'The API request failed.','账号状态已改变，请重新操作':'The account changed. Please try again.','请求超时，结果尚未确认；请刷新核对后再提交':'Request timed out; the outcome is unknown. Refresh and check before resubmitting.',
'已读取当前账号可见的服务端记录。':'Loaded server records visible to this account.','当前范围没有记录。':'No records in this view.','读取未完成':'Loading did not complete.','已退出，服务端会话已撤销。':'Signed out; the server session was revoked.',
'服务端没有返回CSV，未下载文件':'The server did not return CSV; no file was downloaded.','超过5000条，请缩小搜索或状态范围后导出，未下载截断文件。':'More than 5,000 matches. Narrow the search or status filter; no truncated file was downloaded.',
'已导出当前筛选的全部匹配记录（服务端导出时快照，最多5000条）。':'Exported every matching record from a server snapshot (maximum 5,000).',
'请选择1MB以内的PNG/JPEG/WebP图片':'Choose PNG/JPEG/WebP images of 1MB or less.','图片无法解码':'The image could not be decoded.','账号已改变，请重新登录后填写':'The account changed. Sign in again before entering data.','尚无有效责任人，请由管理员配置':'No active assignee is available. Ask the administrator to configure one.',
'账号或巡检已改变，请重新读取':'The account or inspection changed. Reload it.','账号或巡检已改变，请重新读取':'The account or inspection changed. Reload it.',
'请先保存各项修改，或明确放弃未保存内容后重新读取。':'Save the changed checks first, or explicitly discard unsaved changes and reload.',
'当前范围没有巡检记录。':'No inspections in this view.','草稿':'Draft','已提交':'Submitted','查看 / 继续检查':'View / continue','沿用原 V1 工作清单快照，非法规核验。每项单独保存；提交会原子生成问题记录。':'Uses the original working-checklist snapshot, not a verified legal checklist. Save each check separately; submission creates linked issues atomically.',
'放弃本页未保存修改并重新读取':'Discard unsaved changes on this page & reload','结果':'Result','合格':'Pass','说明':'Notes','替换本项照片':'Replace images for this check','明确移除本项已保存照片':'Remove the images saved for this check',
'保存本项':'Save check','自定义检查项':'Custom check','添加自定义项':'Add custom check','完成巡检并提交问题':'Finish inspection & submit issues','关联问题':'Linked issues','尚未保存':'Unsaved','已保存至测试服务':'Saved to the test service',
'AUTH_REQUIRED':'Please sign in.','INVALID_CREDENTIALS':'Incorrect account or password.','PERMISSION_DENIED':'You do not have permission for this action.','REVISION_CONFLICT':'This record changed. Reload its details before saving.',
'INDEPENDENT_REVIEW_REQUIRED':'An independent reviewer must approve this fix.','INVALID_TRANSITION':'This action is not allowed in the current state.','REPORT_NOT_FOUND':'This report is unavailable to this account.',
'INSPECTION_NOT_FOUND':'This inspection is unavailable to this account.','INSPECTION_API_UNAVAILABLE':'The inspection API is not configured.','INVALID_INSPECTION':'Complete all required checks and issue notes before submitting.',
'INSPECTION_OWNER_REQUIRED':'Only the draft owner can change this inspection.','INSPECTION_ALREADY_SUBMITTED':'This inspection has already been submitted.','EXPORT_TOO_LARGE':'Too many matching records; narrow the filter.','AUTH_RUNTIME_UNSUPPORTED':'Sign-in is not supported by this runtime.',
'页面组件加载失败，请刷新重试':'A page component failed to load. Please reload.',
'当前测试身份不能执行此操作':'This simulated role cannot perform this action.','请先开始巡检':'Start an inspection first.','没有可提交的巡检草稿':'There is no inspection draft to submit.','请完成全部检查项':'Complete every check before submitting.',
'请选择测试身份':'Choose a simulated role.','只有管理员可分派待确认事项':'Only the manager can assign unconfirmed issues.','请选择当前可用责任组':'Choose the available assigned team.','截止时间须晚于当前时间':'The due date must be in the future.',
'只有对应责任组可提交整改':'Only the assigned team can submit a fix.','请附上至少一张整改图片':'Attach at least one rectification image.','只有独立复核人员可验收或退回':'Only an independent reviewer can approve or return a fix.','历史记录没有真实整改图片，请退回补充':'This record has no valid rectification image. Return it for more evidence.',
'操作时间不能早于已有审计记录':'Action time cannot be earlier than existing audit events.','时间无效':'Invalid time.','无效操作':'Invalid action.',
'问题上报':'Issue reported','提交整改证据':'Fix evidence submitted','验收通过并关闭':'Approved and closed','验收退回':'Returned for correction',
'本机测试数据':'Local test data','旧版时间未核实':'Legacy date unverified','无期限':'No due date'
};
const segments={
'地点：':'Location: ','创建：':'Created: ','责任：':'Assigned: ','截止：':'Due: ','责任组：':'Team: ',' · 模板版本 ':' · Checklist version ',' · 已检查 ':' · Checked ',' · 问题 ':' · Issues ','查看问题 ':'View issue ',
'已检查 ':'Checked ','问题 ':'Issues ','模板版本 ':'Checklist version ','草稿 ':'Draft ','；法规未核验。':'; not legally verified.','照片 ':'Images: ',' 张':' image(s)','来源巡检：':'Source inspection: ','（模板工作清单，非法规判定）':' (working checklist; not a legal determination)',
'；未确认保存的内容不会自动上传。':'; unconfirmed changes are not uploaded automatically.','；输入仍保留，版本冲突需重新读取。':'; input is preserved. Reload on version conflict.','；若版本冲突，请重新打开详情。':'; reopen details on version conflict.'
};
const patterns=[
[/^请填写有效内容（最多 ?(\d+) ?字）$/,(_,n)=>'Enter a non-empty value (up to '+n+' characters).'],
[/^模板版本 (\d+)；(\d+) 项。沿用原 V1 工作清单，非法规核验。修改不改变已保存草稿和历史。$/,(_,v,n)=>'Checklist version '+v+' · '+n+' checks. Original working checklist, not legally verified. Changes do not alter saved drafts or history.'],
[/^草稿 (.+) · 模板版本 (\d+)。请主动保存草稿，刷新会丢失未保存输入。照片请避开患者、人员面部、证件和其他敏感资料。$/,(_,id,v)=>'Draft '+id+' · Checklist version '+v+'. Save explicitly; a reload loses unsaved input. Keep patients, faces, documents and sensitive information out of photos.'],
[/^已提交巡检 (\d+) 次（按当前搜索）。$/,(_,n)=>n+' submitted inspection(s) matching this search.'],
[/^检查 (\d+) 项；符合 (\d+)，问题 (\d+)，不适用 (\d+)$/,(_,a,b,c,d)=>a+' checks · '+b+' pass · '+c+' issues · '+d+' not applicable'],
[/^巡检已保存，生成 (\d+) 条待确认问题。仅保存在本机。$/,(_,n)=>'Inspection saved with '+n+' unconfirmed issue(s), in this browser only.'],
[/^巡检已提交，生成 (\d+) 条关联问题。$/,(_,n)=>'Inspection submitted with '+n+' linked issue(s).'],
[/^当前页 (\d+) 条( · 还有后续页)?（不是全单位统计）$/,(_,n,more)=>n+' records on this page'+(more?' · more pages':'')+' (not organization-wide statistics)'],
[/^当前页 (\d+) 条巡检（不是全单位统计）$/,(_,n)=>n+' inspections on this page (not organization-wide statistics)'],
[/^已保存照片 (\d+) 张；不选择新照片会保留原图。$/,(_,n)=>n+' image(s) saved. Leave the file input empty to keep them.'],
[/^关闭率 ([\d.]+)%；未关闭 (\d+)。另有 (\d+) 条旧记录时间未核实，不计入月份。$/,(_,a,b,c)=>'Closure rate '+a+'%; '+b+' open. '+c+' legacy record(s) have unverified dates and are excluded.'],
[/^恢复将替换当前本机 (\d+) 条问题、(\d+) 次巡检。请先导出当前备份。将恢复 (\d+) 条问题、(\d+) 次巡检。确认后会先下载当前原始数据备份。是否替换？$/,(_,a,b,c,d)=>'Replace '+a+' local issues and '+b+' inspections with '+c+' issues and '+d+' inspections? Back up first. A raw copy of current data will be downloaded before replacement.'],
[/^恢复失败，未覆盖当前数据：(.*)$/,(_,s)=>'Restore failed; current data was not overwritten: '+translate(s,'en')],
[/^退出尚未确认：(.*)$/,(_,s)=>'Sign-out is unconfirmed: '+translate(s,'en')],
[/^无法访问本地存储：(.*)$/,(_,s)=>'Local storage is unavailable: '+translate(s,'en')],
[/^保存失败，未变更记录，请保留表单并导出备份。(.*)$/,(_,s)=>'Save failed; records were not changed. Keep your form and export a backup. '+translate(s,'en')],
[/^本地数据无法读取，已停止写入以保护原数据。请先导出原始备份。(.*)$/,(_,s)=>'Local data could not be read. Writes are locked to protect it. Export a raw backup first. '+translate(s,'en')]
];
function resolveLanguage({query,saved,browser='zh'}={}){return ['en','zh'].includes(query)?query:['en','zh'].includes(saved)?saved:/^zh/i.test(browser)?'zh':'en';}
function translate(value,language='en'){
 const str=String(value??'');if(language!=='en')return str;
 const leading=str.match(/^\s*/)[0],trailing=str.match(/\s*$/)[0],trimmed=str.trim();
 if(Object.hasOwn(dictionary,trimmed))return leading+dictionary[trimmed]+trailing;
 for(const[re,replace]of patterns)if(re.test(trimmed))return leading+trimmed.replace(re,replace)+trailing;
 const compound=str.split(/(\s[·/]\s|：)/);if(compound.length>1)return compound.map(piece=>piece==='：'?': ':/^\s[·/]\s$/.test(piece)?piece:translate(piece,language)).join('');
 let result=str;for(const[key,text]of Object.entries(segments))result=result.split(key).join(text);
 return result;
}
const exported={translate,resolveLanguage};if(typeof module!=='undefined'&&module.exports)module.exports=exported;
if(!root.document)return;
let saved;try{saved=localStorage.getItem('sf-ui-language');}catch{}
let language=resolveLanguage({query:new URL(location.href).searchParams.get('lang'),saved,browser:navigator.language});
try{localStorage.setItem('sf-ui-language',language);}catch{}
const textState=new WeakMap(),attrState=new WeakMap();
function applyText(node){
 if(!node.parentElement||node.parentElement.closest('script,style,textarea,[data-i18n-skip]'))return;
 const previous=textState.get(node),source=previous&&node.nodeValue===previous.rendered?previous.source:node.nodeValue;
 const rendered=translate(source,language);textState.set(node,{source,rendered});
 if(node.parentElement.tagName==='OPTION'&&!node.parentElement.hasAttribute('value'))node.parentElement.setAttribute('value',node.parentElement.value);
 if(node.nodeValue!==rendered)node.nodeValue=rendered;
}
function refresh(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode())applyText(node);
 for(const el of document.querySelectorAll('[placeholder],[title],[aria-label]')){if(el.closest('[data-i18n-skip]'))continue;
  const state=attrState.get(el)||{};for(const name of ['placeholder','title','aria-label'])if(el.hasAttribute(name)){const current=el.getAttribute(name),old=state[name],source=old&&current===old.rendered?old.source:current,rendered=translate(source,language);state[name]={source,rendered};if(current!==rendered)el.setAttribute(name,rendered);}attrState.set(el,state);
 }
 document.documentElement.lang=language==='en'?'en':'zh-CN';document.documentElement.classList.toggle('lang-en',language==='en');
 document.title=language==='en'?(new URL(location.href).searchParams.get('mode')==='server'?'Safety Flow · Account preview':'Safety Flow · Local trial'):'Safety Flow 安巡记 · '+(new URL(location.href).searchParams.get('mode')==='server'?'账号联调':'本机测试');
 for(const a of document.querySelectorAll('.header-actions a[href],.mode-notice a[href]')){const link=new URL(a.getAttribute('href'),location.href);if(link.origin===location.origin){link.searchParams.set('lang',language);const href=link.pathname+link.search;if(a.getAttribute('href')!==href)a.setAttribute('href',href);}}
 const button=document.querySelector('#languageToggle');if(button){const label=language==='en'?'中文':'English',aria=language==='en'?'切换为中文':'Switch to English';if(button.textContent!==label)button.textContent=label;if(button.getAttribute('aria-label')!==aria)button.setAttribute('aria-label',aria);}
}
function setLanguage(value){
 if(!['en','zh'].includes(value))return;language=value;try{localStorage.setItem('sf-ui-language',value);}catch{}
 const url=new URL(location.href);url.searchParams.set('lang',value);history.replaceState(null,'',url);refresh();
 document.dispatchEvent(new CustomEvent('sf-language-change',{detail:{language}}));
}
root.SafetyI18n={t:value=>translate(value,language),get language(){return language;},setLanguage,refresh};
document.querySelector('#languageToggle')?.addEventListener('click',()=>setLanguage(language==='en'?'zh':'en'));
const nativeConfirm=root.confirm.bind(root);root.confirm=value=>nativeConfirm(translate(value,language));
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;refresh();});}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
refresh();
})(typeof globalThis!=='undefined'?globalThis:this);
