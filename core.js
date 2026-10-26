(function (root) {
  'use strict';
  const stages = ['report', 'action', 'verify', 'closed'];
  const actors = {
    inspector: { name: '巡查人员', role: 'inspector' },
    manager: { name: '安全管理员', role: 'manager' },
    worker: { name: '现场责任组', role: 'worker' },
    reviewer: { name: '复核人员', role: 'reviewer' }
  };
  function requireValue(ok, message) { if (!ok) throw new Error(message); }
  function text(value, max = 500) {
    requireValue(typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max, '请填写有效内容（最多 ' + max + ' 字）');
    return value.trim();
  }
  function validDate(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
  function evidence(value) {
    requireValue(Array.isArray(value) && value.length <= 3, '每次最多 3 张图片');
    for (const x of value) requireValue(x && typeof x.name === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(x.data) && x.data.length <= 1400000, '图片须为 PNG/JPEG/WebP，单张不超过 1MB');
    return structuredClone(value);
  }
  function audit(item, action, actor, at, note, from) {
    item.history.push({ action, actor: actor.name, role: actor.role, at, note: note || '', from, to: item.stage });
    item.updatedAt = at;
  }
  function report(input, actor, at = new Date().toISOString(), id = 'SF-' + crypto.randomUUID()) {
    requireValue(actor && actors[actor.role]?.name === actor.name, '请选择测试身份');
    requireValue(validDate(at), '时间无效');
    const item = { id, location: text(input.location, 120), desc: text(input.desc, 500), stage: 'report', createdAt: at, updatedAt: at, assignee: null, due: null, reportEvidence: evidence(input.photos || []), rectificationEvidence: [], history: [], testData: true };
    audit(item, '问题上报', actor, at, '', null);
    return item;
  }
  function transition(item, action, input, actor, at = new Date().toISOString()) {
    const x = structuredClone(item), from = x.stage;
    requireValue(actor && actors[actor.role]?.name === actor.name, '请选择测试身份');
    requireValue(validDate(at), '时间无效');
    const knownTimes = [x.createdAt, x.updatedAt, ...x.history.map(h => h.at)].filter(validDate).map(value => Date.parse(value));
    requireValue(knownTimes.every(value => Date.parse(at) >= value), '操作时间不能早于已有审计记录');
    if (action === 'assign') {
      requireValue(from === 'report' && actor.role === 'manager', '只有管理员可分派待确认事项');
      x.assignee = text(input.assignee, 100);
      requireValue(x.assignee === actors.worker.name, '请选择当前可用责任组');
      requireValue(validDate(input.due) && Date.parse(input.due) > Date.parse(at), '截止时间须晚于当前时间');
      x.due = new Date(input.due).toISOString(); x.stage = 'action';
    } else if (action === 'rectify') {
      requireValue(from === 'action' && actor.role === 'worker' && x.assignee === actor.name, '只有对应责任组可提交整改');
      const photos = evidence(input.photos || []);
      requireValue(photos.length > 0, '请附上至少一张整改图片');
      x.rectificationNote = text(input.note); x.rectificationEvidence = photos;
      x.rectifier = actor.name; x.stage = 'verify';
    } else if (action === 'approve' || action === 'reject') {
      requireValue(from === 'verify' && actor.role === 'reviewer' && x.rectifier !== actor.name, '只有独立复核人员可验收或退回');
      if (action === 'approve') requireValue(x.rectificationEvidence.length > 0, '历史记录没有真实整改图片，请退回补充');
      x.stage = action === 'approve' ? 'closed' : 'action';
      if (action === 'approve') x.closedAt = at;
      text(input.note);
    } else throw new Error('无效操作');
    const labels = { assign: '确认并分派', rectify: '提交整改证据', approve: '验收通过并关闭', reject: '验收退回' };
    // Retain every submitted evidence revision in local history after a rejection.
    audit(x, labels[action], actor, at, input.note, from);
    if (action === 'assign') Object.assign(x.history.at(-1), { assignee: x.assignee, due: x.due });
    if (action === 'rectify') x.history.at(-1).photos = structuredClone(x.rectificationEvidence);
    return x;
  }
  function overdue(x, now = Date.now()) { return x.stage !== 'closed' && validDate(x.due) && Date.parse(x.due) < now; }
  function validItems(items) {
    requireValue(Array.isArray(items) && items.length <= 10000, '本地记录格式无效');
    const ids = new Set();
    for (const x of items) {
      requireValue(x && typeof x.id === 'string' && !ids.has(x.id) && stages.includes(x.stage), '记录编号或状态无效'); ids.add(x.id);
      text(x.location, 120); text(x.desc); requireValue(Array.isArray(x.history), '操作历史无效');
      evidence(x.reportEvidence); evidence(x.rectificationEvidence);
      requireValue(x.history.every(h => h && typeof h === 'object' && !Array.isArray(h) && typeof h.action === 'string' && typeof h.actor === 'string' && (!h.at || validDate(h.at))), '操作历史格式无效');
      for (const h of x.history) if (h.photos) evidence(h.photos);
      requireValue(x.createdAt === null || validDate(x.createdAt), '创建时间无效');
      requireValue(x.due === null || validDate(x.due), '截止时间无效');
      requireValue(x.assignee === null || typeof x.assignee === 'string', '责任人格式无效');
      // Legacy imports explicitly lack verified dates/evidence; do not invent either.
      // New records must preserve a continuous state history and a real closure event.
      if (x.createdAt !== null) {
        requireValue(x.history.length > 0 && validDate(x.updatedAt), '操作历史或更新时间无效');
        let previousState = null, previousTime = Date.parse(x.createdAt);
        const allowed = { report: ['action'], action: ['verify'], verify: ['action', 'closed'], closed: [] };
        for (let index = 0; index < x.history.length; index++) {
          const h = x.history[index];
          requireValue(validDate(h.at) && Date.parse(h.at) >= previousTime, '审计时间顺序无效');
          requireValue(h.from === previousState && (index === 0 ? h.to === 'report' : allowed[previousState]?.includes(h.to)), '状态与审计历史不一致');
          previousState = h.to; previousTime = Date.parse(h.at);
        }
        requireValue(previousState === x.stage && Date.parse(x.updatedAt) === previousTime, '当前状态与审计历史不一致');
        if (x.stage === 'closed') {
          const last = x.history.at(-1);
          requireValue(last.action === '验收通过并关闭' && last.role === 'reviewer' && last.actor !== x.rectifier && x.rectificationEvidence.length > 0 && validDate(x.closedAt) && Date.parse(x.closedAt) === previousTime, '关闭记录缺少独立验收或整改证据');
        }
      }
    }
    return items;
  }
  function decode(raw) {
    const data = JSON.parse(raw);
    requireValue(data?.version === 2, '不支持的本地数据版本');
    return validItems(data.items);
  }
  function migrate(raw) {
    const rows = JSON.parse(raw); requireValue(Array.isArray(rows), '旧数据格式无效');
    return validItems(rows.map(x => ({ ...x, createdAt: null, updatedAt: null, due: null, legacyCreated: x.created, legacyDue: x.due, reportEvidence: [], rectificationEvidence: [], testData: true, history: x.history.map(h => ({ action: String(h[0]), actor: String(h[1]), at: null, note: '旧版展示记录，原始时间未核实' })) })));
  }
  function serialize(items, workspace) { validItems(items); return JSON.stringify({ version: 2, mode: 'local-test-only', items, ...(workspace === undefined ? {} : {workspace}) }); }
  function persist(storage, key, next, expected, workspace) {
    // Callers must serialize cross-tab writes with a shared Web Lock. These
    // revision checks detect stale/reentrant writes; localStorage is not CAS.
    requireValue(storage.getItem(key) === expected, '其他标签页已更新数据，请刷新后重试');
    const raw = serialize(next, workspace);
    requireValue(storage.getItem(key) === expected, '其他标签页已更新数据，请刷新后重试');
    storage.setItem(key, raw); return raw;
  }
  function csvCell(value) {
    let s = String(value ?? ''); if (/^[\s]*[=+\-@]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  }
  function csv(items) {
    return '\uFEFF' + [['编号', '地点', '问题', '状态', '责任组', '截止时间', '创建时间', '关闭时间', '数据用途'], ...items.map(x => [x.id, x.location, x.desc, x.stage, x.assignee, x.due, x.createdAt, x.closedAt, '本机测试数据'])].map(row => row.map(csvCell).join(',')).join('\r\n');
  }
  const api = { actors, report, transition, overdue, decode, migrate, serialize, persist, csv };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SafetyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
