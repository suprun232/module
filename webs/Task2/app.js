(function(){
  const LS_KEYS = { TRAINS:'sp:v2:trains', TRACKS:'sp:v2:tracks' };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const toMinutes = (hhmm) => {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm || '');
    return m ? (+m[1])*60 + (+m[2]) : NaN;
  };
  const fromLS = (k, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : (v || fallback); }
    catch(_){ return fallback; }
  };
  const toLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // Дані
  let tracks = fromLS(LS_KEYS.TRACKS, null);
  let trains = fromLS(LS_KEYS.TRAINS, null);
  if(!tracks || !trains){
    tracks = window.SEED.tracks; trains = window.SEED.trains;
    toLS(LS_KEYS.TRACKS, tracks); toLS(LS_KEYS.TRAINS, trains);
  }

  // DOM
  const tbody = $('#trainsTbody');
  const filtersForm = $('#filters');
  const segmentFilter = $('#segment');
  const form = $('#trainForm');
  const btnAdd = $('#btnAdd');
  const segmentSel = $('#segmentSel');

  // Опції ділянок
  function populateSegments(){
    segmentFilter.innerHTML = ['<option value="">Всі</option>'].concat(tracks.map(t=>`<option value="${t.id}">${t.name}</option>`)).join('');
    segmentSel.innerHTML = tracks.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  }
  populateSegments();

  // Відмальовка
  let sort = { key:null, dir:1 };

  function getTrackCondition(id){
    return (tracks.find(t => t.id === id) || {}).condition || '—';
  }
  function matchesFilter(row){
    const q = (filtersForm.q.value || '').trim().toLowerCase();
    const st = filtersForm.status.value;
    const seg = filtersForm.segment.value;
    let ok = true;
    if(q){
      ok = [row.no, row.direction, row.location].some(v => String(v).toLowerCase().includes(q));
    }
    if(ok && st){ ok = row.status === st; }
    if(ok && seg){ ok = row.segmentId === seg; }
    return ok;
  }
  function cmp(a,b,key){
    if(key==='dep' || key==='arr'){
      return (toMinutes(a[key]) - toMinutes(b[key])) * sort.dir;
    }
    const va = String(a[key]).toLowerCase();
    const vb = String(b[key]).toLowerCase();
    if(va<vb) return -1*sort.dir;
    if(va>vb) return 1*sort.dir;
    return 0;
  }
  function badge(status){
    const cls = status === 'За розкладом' ? 'ok' : status === 'Запізнюється' ? 'late' : 'cancel';
    return `<span class="badge badge--${cls}">${status}</span>`;
  }
  function condChip(cond){
    if(cond==='Норма') return `<span class="chip--khaki">Норма</span>`;
    if(cond==='Ремонт') return `<span class="chip--danger">Ремонт</span>`;
    return `<span class="chip--warn">Обмеження швидкості</span>`;
  }
  function renderTable(){
    let rows = trains.filter(matchesFilter);
    if(sort.key){ rows = rows.slice().sort((a,b)=>cmp(a,b,sort.key)); }
    tbody.innerHTML = '';
    for(const r of rows){
      const cond = getTrackCondition(r.segmentId);
      const tr = document.createElement('tr');
      tr.dataset.no = r.no; tr.dataset.segment = r.segmentId;
      tr.innerHTML = `
        <th scope="row">${r.no}</th>
        <td>${r.direction}</td>
        <td>${r.dep}</td>
        <td>${r.arr}</td>
        <td>${r.location}</td>
        <td>${badge(r.status)}</td>
        <td>${condChip(cond)}</td>
        <td class="actions">
          <button class="btn btn--ghost js-edit" aria-label="Редагувати ${r.no}" title="Редагувати">✎</button>
          <button class="btn btn--ghost js-del" aria-label="Видалити ${r.no}" title="Видалити">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  // Сортування
  $('#trainsTable thead').addEventListener('click', (e)=>{
    const th = e.target.closest('th[data-sort]');
    if(!th) return;
    const key = th.dataset.sort;
    sort.dir = (sort.key === key) ? -sort.dir : 1;
    sort.key = key;
    renderTable();
  });
  $('#trainsTable thead').addEventListener('keypress', (e)=>{
    if(e.key!=='Enter' && e.key!==' ') return;
    const th = e.target.closest('th[data-sort]');
    if(!th) return;
    const key = th.dataset.sort;
    sort.dir = (sort.key === key) ? -sort.dir : 1;
    sort.key = key;
    renderTable();
  });

  // Фільтри
  filtersForm.addEventListener('input', renderTable);
  filtersForm.addEventListener('change', renderTable);

  // Перемикач щільності
  $$('.js-density').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const mode = btn.dataset.mode; // normal | compact
      document.body.classList.toggle('density-compact', mode === 'compact');
      $$('.js-density').forEach(b=>b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
    });
  });

  // Валідація
  function validate(values, {editingOldNo=null}={}){
    const errors = {};
    const required = ['no','direction','dep','arr','location','segmentId','status'];
    for(const k of required){ if(!values[k] || !String(values[k]).trim()) errors[k]='Обовʼязкове поле'; }
    const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if(values.dep && !timeRe.test(values.dep)) errors.dep = 'Формат HH:MM';
    if(values.arr && !timeRe.test(values.arr)) errors.arr = 'Формат HH:MM';
    // Унікальність №
    const exists = trains.some(t => t.no.toLowerCase() === values.no.toLowerCase() && t.no !== editingOldNo);
    if(exists) errors.no = '№ рейсу має бути унікальним';
    return { ok: Object.keys(errors).length===0, errors };
  }

  // Робота з формою
  function readForm(){
    return {
      no: $('#no').value.trim(),
      direction: $('#direction').value.trim(),
      dep: $('#dep').value.trim(),
      arr: $('#arr').value.trim(),
      location: $('#location').value.trim(),
      status: $('#statusSel').value,
      segmentId: $('#segmentSel').value
    };
  }
  function resetFormToAdd(){
    $('#mode').value = 'add'; $('#oldNo').value = '';
    form.reset();
  }
  $('#resetForm').addEventListener('click', resetFormToAdd);
  btnAdd.addEventListener('click', ()=>{ resetFormToAdd(); $('#no').focus(); });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const mode = $('#mode').value;
    const oldNo = $('#oldNo').value;
    const values = readForm();
    const { ok, errors } = validate(values, { editingOldNo: mode==='edit' ? oldNo : null });
    if(!ok){
      alert('Перевірте форму:\n' + Object.entries(errors).map(([k,v])=>`• ${k}: ${v}`).join('\n'));
      return;
    }
    if(mode==='add'){
      trains.push(values);
    }else{
      const idx = trains.findIndex(t => t.no === oldNo);
      if(idx>-1) trains[idx] = values;
    }
    toLS(LS_KEYS.TRAINS, trains);
    renderTable();
    resetFormToAdd();
  });

  // Редагування / Видалення (делегування)
  tbody.addEventListener('click', (e)=>{
    const editBtn = e.target.closest('.js-edit');
    const delBtn = e.target.closest('.js-del');
    if(editBtn){
      const no = editBtn.closest('tr').dataset.no;
      const t = trains.find(x => x.no === no);
      if(!t) return;
      $('#mode').value = 'edit'; $('#oldNo').value = t.no;
      $('#no').value = t.no;
      $('#direction').value = t.direction;
      $('#dep').value = t.dep;
      $('#arr').value = t.arr;
      $('#location').value = t.location;
      $('#statusSel').value = t.status;
      $('#segmentSel').value = t.segmentId;
      $('#no').focus();
    } else if(delBtn){
      const no = delBtn.closest('tr').dataset.no;
      if(confirm(`Видалити рейс ${no}?`)){
        trains = trains.filter(t => t.no !== no);
        toLS(LS_KEYS.TRAINS, trains);
        renderTable();
      }
    }
  });

  // Схема (SVG) і підсвітка
  function trackClass(cond){
    return cond==='Норма' ? 'track-ok' : (cond==='Ремонт' ? 'track-danger' : 'track-warn');
  }
  function mapSvg(){
    const cond = id => getTrackCondition(id);
    return `
    <svg class="track" viewBox="0 0 600 200" aria-label="Схема колій">
      <g class="legend" font-size="12">
        <rect x="10" y="10" width="16" height="8" class="track-ok" rx="2"></rect>
        <text x="30" y="18" fill="#6b7280">Норма</text>
        <rect x="90" y="10" width="16" height="8" class="track-warn" rx="2"></rect>
        <text x="110" y="18" fill="#6b7280">Обмеження</text>
        <rect x="210" y="10" width="16" height="8" class="track-danger" rx="2"></rect>
        <text x="230" y="18" fill="#6b7280">Ремонт</text>
      </g>
      ${seg('AB','A–B',  40,120,140,120, cond('AB'))}
      ${seg('BC','B–C', 140,120,240,120, cond('BC'))}
      ${seg('CD','C–D', 240,120,340,120, cond('CD'))}
      ${seg('DE','D–E', 340,120,440,120, cond('DE'))}
      ${seg('EF','E–F', 440,120,540,120, cond('EF'))}
      ${poly('BY1','Обвідна 1','240,120 340,60 440,120', cond('BY1'))}
      ${station('A',40,120)} ${station('B',140,120)} ${station('C',240,120)}
      ${station('D',340,120)} ${station('E',440,120)} ${station('F',540,120)}
    </svg>`;
  }
  function seg(id,label,x1,y1,x2,y2,c){
    return `<g tabindex="0" data-seg="${id}" aria-label="Ділянка ${label}: ${c}">
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${trackClass(c)}" />
      <title>${label} — ${c}</title>
    </g>`;
  }
  function poly(id,label,points,c){
    return `<g tabindex="0" data-seg="${id}" aria-label="Ділянка ${label}: ${c}">
      <polyline points="${points}" class="${trackClass(c)}" fill="none" />
      <title>${label} — ${c}</title>
    </g>`;
  }
  function station(n,x,y){
    return `<g transform="translate(${x},${y})">
      <circle class="station" r="6"></circle>
      <text class="station-label" x="0" y="20">${n}</text>
    </g>`;
  }
  function renderMap(){
    $('#trackMap').innerHTML = mapSvg();
    // Слухачі на сегменти
    $$('#trackMap [data-seg]').forEach(el=>{
      el.addEventListener('mouseenter', ()=>highlightBySegment(el.dataset.seg, true));
      el.addEventListener('mouseleave', ()=>highlightBySegment(el.dataset.seg, false));
      el.addEventListener('focus', ()=>highlightBySegment(el.dataset.seg, true));
      el.addEventListener('blur', ()=>highlightBySegment(el.dataset.seg, false));
      el.addEventListener('click', ()=>{
        segmentFilter.value = el.dataset.seg;
        renderTable();
      });
    });
  }
  function highlightBySegment(segId, on){
    // Таблиця
    $$(`tr[data-segment="${segId}"]`, tbody).forEach(tr=> tr.classList.toggle('is-highlight', on));
    // Лінія
    $$(`#trackMap [data-seg="${segId}"] *`).forEach(n => n.classList.toggle('track-hover', on));
  }
  // Ховер рядка → підсвітити сегмент
  tbody.addEventListener('mouseover', (e)=>{
    const tr = e.target.closest('tr[data-segment]');
    if(!tr) return;
    highlightBySegment(tr.dataset.segment, true);
  });
  tbody.addEventListener('mouseout', (e)=>{
    const tr = e.target.closest('tr[data-segment]');
    if(!tr) return;
    highlightBySegment(tr.dataset.segment, false);
  });
  tbody.addEventListener('focusin', (e)=>{
    const tr = e.target.closest('tr[data-segment]');
    if(!tr) return;
    highlightBySegment(tr.dataset.segment, true);
  });
  tbody.addEventListener('focusout', (e)=>{
    const tr = e.target.closest('tr[data-segment]');
    if(!tr) return;
    highlightBySegment(tr.dataset.segment, false);
  });

  // Старт
  renderMap();
  renderTable();
})();
