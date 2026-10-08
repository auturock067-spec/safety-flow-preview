const seed=[
  {id:"SF-001",location:"地下车库",desc:"消防通道堆放纸箱，影响通行",stage:"report",created:"今天 09:18",evidence:true,assignee:null,due:null,history:[["问题上报","巡查人员 · 今天 09:18"]]},
  {id:"SF-002",location:"3#配电房",desc:"配电柜前堆放维修材料",stage:"action",created:"昨天 16:20",evidence:true,assignee:"设备维修组",due:"明天 17:00",history:[["问题上报","检查人员 · 昨天 16:20"],["确认并分派","安全管理员 · 昨天 16:35"]]},
  {id:"SF-003",location:"设备机房",desc:"检修后防护罩未复位",stage:"verify",created:"昨天 14:05",evidence:true,assignee:"维保单位",due:"今天 12:00",history:[["问题上报","检查人员 · 昨天 14:05"],["确认并分派","安全管理员 · 昨天 14:20"],["提交整改证据","维保单位 · 今天 10:42"]]},
  {id:"SF-004",location:"员工食堂",desc:"燃气阀门区域堆放杂物",stage:"action",created:"前天 11:40",evidence:true,assignee:"后勤维修",due:"昨天 18:00",history:[["问题上报","巡查人员 · 前天 11:40"],["确认并分派","安全管理员 · 前天 11:55"]]}
];
let items=JSON.parse(localStorage.getItem("sf-preview")||"null")||seed;
let view="reports";
const save=()=>localStorage.setItem("sf-preview",JSON.stringify(items));
const nowLabel=()=>new Date().toLocaleString("zh-CN",{hour12:false,month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
function overdue(x){return x.stage!=="closed"&&x.due&&x.due.includes("昨天")}
function counts(){return{
  reports:items.filter(x=>x.stage==="report").length,
  actions:items.filter(x=>x.stage==="action").length,
  verify:items.filter(x=>x.stage==="verify").length,
  overdue:items.filter(overdue).length,
  closed:items.filter(x=>x.stage==="closed").length
}}
function renderStats(){const c=counts();document.querySelector("#stats").innerHTML=[
  ["待确认",c.reports],["待整改",c.actions],["待验收",c.verify],["已关闭",c.closed]
].map(([k,v])=>`<div class="stat"><strong>${v}</strong><span>${k}</span></div>`).join("");
document.querySelector("#badgeReports").textContent=c.reports||"";
document.querySelector("#badgeActions").textContent=c.actions||"";
document.querySelector("#badgeVerify").textContent=c.verify||"";
document.querySelector("#badgeOverdue").textContent=c.overdue||"";
}
const labels={reports:["TRIAGE","待确认"],actions:["ACTION","我的整改"],verify:["VERIFICATION","待我验收"],overdue:["OVERDUE","已超期"],ledger:["LEDGER","台账"]};
function filtered(){
 if(view==="reports")return items.filter(x=>x.stage==="report");
 if(view==="actions")return items.filter(x=>x.stage==="action");
 if(view==="verify")return items.filter(x=>x.stage==="verify");
 if(view==="overdue")return items.filter(overdue);
 return items;
}
function actionButtons(x){
 if(view==="reports")return `<button class="primary" onclick="triage('${x.id}')">确认并分派</button><button class="ghost" onclick="openDetail('${x.id}')">详情</button>`;
 if(view==="actions")return `<button class="primary" onclick="rectify('${x.id}')">提交整改</button><button class="ghost" onclick="openDetail('${x.id}')">详情</button>`;
 if(view==="verify")return `<button class="success" onclick="verifyItem('${x.id}')">验收通过</button><button class="danger" onclick="rejectItem('${x.id}')">退回</button><button class="ghost" onclick="openDetail('${x.id}')">详情</button>`;
 return `<button class="ghost" onclick="openDetail('${x.id}')">查看</button>`;
}
function stageTag(x){
 const map={report:["待确认","warn"],action:["整改中",""],verify:["待验收","warn"],closed:["已关闭","ok"]};const [t,c]=map[x.stage]||["未知",""];
 return `<span class="tag ${c}">${t}</span>${overdue(x)?'<span class="tag danger">超期</span>':""}`;
}
function renderList(){
 const [e,t]=labels[view];document.querySelector("#viewEyebrow").textContent=e;document.querySelector("#viewTitle").textContent=t;
 const arr=filtered();document.querySelector("#list").innerHTML=arr.length?arr.map(x=>`
 <article class="card">
   <div><div>${stageTag(x)}</div><h4>${x.desc}</h4><div class="meta"><span>${x.id}</span><span>📍 ${x.location}</span><span>${x.created}</span>${x.assignee?'<span>👤 '+x.assignee+'</span>':""}${x.due?'<span>⏱ '+x.due+'</span>':""}</div></div>
   <div class="card-actions">${actionButtons(x)}</div>
 </article>`).join(""):`<div class="empty">这里暂时没有事项。</div>`;
}
function render(){renderStats();renderList();save()}
window.triage=id=>{const x=items.find(i=>i.id===id);x.stage="action";x.assignee="现场责任组";x.due="明天 17:00";x.history.push(["确认并分派","安全管理员 · "+nowLabel()]);render()}
window.rectify=id=>{const x=items.find(i=>i.id===id);x.stage="verify";x.history.push(["提交整改证据","整改责任人 · "+nowLabel()]);render()}
window.verifyItem=id=>{const x=items.find(i=>i.id===id);x.stage="closed";x.history.push(["验收通过并关闭","验收人员 · "+nowLabel()]);render()}
window.rejectItem=id=>{const x=items.find(i=>i.id===id);x.stage="action";x.history.push(["验收退回：请补充整改证据","验收人员 · "+nowLabel()]);render()}
window.openDetail=id=>{const x=items.find(i=>i.id===id);document.querySelector("#detailContent").innerHTML=`
 <div class="dialog-head"><div><div class="eyebrow">${x.id}</div><h3>${x.desc}</h3></div><button class="icon-btn" onclick="detailDialog.close()">×</button></div>
 <div class="meta"><span>📍 ${x.location}</span>${x.assignee?'<span>👤 '+x.assignee+'</span>':""}${x.due?'<span>⏱ '+x.due+'</span>':""}</div>
 <div class="timeline">${x.history.map(h=>`<div class="event"><strong>${h[0]}</strong><span>${h[1]}</span></div>`).join("")}</div>`;
 document.querySelector("#detailDialog").showModal();}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");view=b.dataset.view;renderList()}));
const reportDialog=document.querySelector("#reportDialog");
document.querySelector("#newReportBtn").onclick=()=>reportDialog.showModal();
document.querySelector("#reportForm").addEventListener("submit",e=>{const loc=document.querySelector("#locationInput").value,desc=document.querySelector("#descInput").value.trim();if(!loc||!desc)return;
 items.unshift({id:"SF-"+String(items.length+5).padStart(3,"0"),location:loc,desc,stage:"report",created:"刚刚",evidence:!!document.querySelector("#photoInput").files.length,assignee:null,due:null,history:[["问题上报","当前用户 · "+nowLabel()]]});document.querySelector("#reportForm").reset();render();});
document.querySelector("#resetBtn").onclick=()=>{items=structuredClone(seed);render()};
render();