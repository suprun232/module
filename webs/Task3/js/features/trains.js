window.App = window.App || {};
window.App.features = window.App.features || {};
(function(App, $, ui, utils){
  function render($root){
    const state = App.store.get();
    const filters = ui.filters.create({
      tracks: state.tracks,
      onChange: ()=> table.refresh()
    });

    const $section = $('<section class="card">');
    const header = $(`
      <div class="actions" style="justify-content:space-between;margin-bottom:.5rem">
        <h2 style="margin:0">Рейси</h2>
        <button class="btn" id="add">+ Додати рейс</button>
      </div>
    `);
    $section.append(header, filters.$el);

    // ✅ Хост для таблиці, який уже у DOM
    const $tableHost = $('<div class="table-host" style="margin-top:.5rem;"></div>');
    $section.append($tableHost);
    $root.append($section);

    // Конфіг колонок
    const columns = [
      { title:'№', key:'no', sortKey:'no' },
      { title:'Напрямок', key:'direction' },
      { title:'Відпр.', key:'dep', sortKey:'dep' },
      { title:'Приб.', key:'arr', sortKey:'arr' },
      { title:'Місце', key:'location' },
      { title:'Статус', key:'status', sortKey:'status', render: r => utils.badge(r.status) },
      { title:'Ділянка', key:'segmentId' },
      { title:'Стан колії', key:'trackCond', render: r => {
          const c = App.store.getTrackCond(r.segmentId);
          if(c==='Норма') return `<span class="mark ok"></span> Норма`;
          if(c==='Ремонт') return `<span class="mark danger"></span> Ремонт`;
          return `<span class="mark warn"></span> Обмеження`;
        } 
      },
      { title:'Дії', key:'actions', render: r => `
          <div class="actions">
            <button class="btn btn--ghost" data-edit="${r.no}">✎</button>
            <button class="btn btn--ghost" data-del="${r.no}">🗑</button>
          </div>` }
    ];

    // ✅ Передаємо РЕАЛЬНИЙ контейнер
    const table = ui.Table($tableHost, {
      columns,
      getData: ({ sortKey, sortDir, page, pageSize }) => {
        const q = filters.get();
        return App.store.listTrains({ ...q, sortKey, sortDir, page, pageSize });
      },
      pageSize: 8
    });

    // Інлайн-редагування статусу
    function enableInlineEdit(){
      $tableHost.find('tbody tr').each(function(){
        const $tr = $(this);
        const no = $tr.data('no'); if(!no) return;
        const $cell = $tr.children().eq(5); // колонка "Статус"
        const current = $cell.text().trim();
        $cell.attr('tabindex','0').attr('role','button').attr('aria-label',`Змінити статус для ${no}`);
        $cell.off('click keypress').on('click keypress', function(e){
          if(e.type==='click' || e.key==='Enter' || e.key===' '){
            const sel = $(`
              <select>
                <option ${current==='За розкладом'?'selected':''}>За розкладом</option>
                <option ${current==='Запізнюється'?'selected':''}>Запізнюється</option>
                <option ${current==='Скасовано'?'selected':''}>Скасовано</option>
              </select>`);
            $cell.empty().append(sel);
            sel.focus();
            sel.on('change blur', function(){
              const val = $(this).val();
              try{
                App.store.updateTrain(no, { status: val });
                ui.toast.show(`Статус оновлено: ${no} → ${val}`);
              }catch(err){ alert(err.message); }
              table.refresh(); enableInlineEdit();
            });
          }
        });
      });
    }

    // Дії
    $section.on('click', '[data-edit]', function(){
      const no = $(this).data('edit');
      const t = App.store.get().trains.find(x => x.no === no);
      openForm(t, (values, oldNo)=> {
        try{ App.store.updateTrain(oldNo, values); ui.toast.show('Рейс оновлено'); table.refresh(); enableInlineEdit(); }
        catch(err){ alert(err.message); }
      });
    });
    $section.on('click', '[data-del]', function(){
      const no = $(this).data('del');
      if(confirm(`Видалити ${no}?`)){ App.store.removeTrain(no); ui.toast.show('Видалено'); table.refresh(); enableInlineEdit(); }
    });
    $section.find('#add').on('click', function(){
      openForm(null, (values)=>{ 
        try{ App.store.addTrain(values); ui.toast.show('Рейс додано'); table.refresh(); enableInlineEdit(); }
        catch(err){ alert(err.message); }
      });
    });

    App.store.subscribe(()=>{ table.refresh(); enableInlineEdit(); });
    enableInlineEdit();
  }

  function openForm(data, onSubmit){
    const isEdit = !!data;
    const html = $(`
      <form class="grid" style="grid-template-columns:1fr 1fr;gap:.75rem" autocomplete="off">
        <div style="grid-column:1 / -1">
          <label>№ рейсу *</label>
          <input name="no" required placeholder="IC123" value="${data?data.no:''}">
        </div>
        <div style="grid-column:1 / -1">
          <label>Напрямок *</label>
          <input name="direction" required placeholder="Центральна → Південна" value="${data?data.direction:''}">
        </div>
        <div>
          <label>Відпр. (HH:MM) *</label>
          <input name="dep" required placeholder="07:10" value="${data?data.dep:''}">
        </div>
        <div>
          <label>Приб. (HH:MM) *</label>
          <input name="arr" required placeholder="09:40" value="${data?data.arr:''}">
        </div>
        <div style="grid-column:1 / -1">
          <label>Поточне місце *</label>
          <input name="location" required placeholder="Станція D / Ділянка B–C" value="${data?data.location:''}">
        </div>
        <div>
          <label>Статус</label>
          <select name="status">
            <option ${data&&data.status==='За розкладом'?'selected':''}>За розкладом</option>
            <option ${data&&data.status==='Запізнюється'?'selected':''}>Запізнюється</option>
            <option ${data&&data.status==='Скасовано'?'selected':''}>Скасовано</option>
          </select>
        </div>
        <div>
          <label>Ділянка</label>
          <select name="segmentId">
            ${App.store.listTracks().map(t=>`<option value="${t.id}" ${data&&data.segmentId===t.id?'selected':''}>${t.name}</option>`).join('')}
          </select>
        </div>
        <div style="grid-column:1 / -1" class="actions">
          <button class="btn" type="submit">Зберегти</button>
          <button class="btn btn--ghost" type="button" data-cancel>Скасувати</button>
        </div>
      </form>
    `);
    html.on('click','[data-cancel]', ()=>App.ui.modal.close());
    html.on('submit', function(e){
      e.preventDefault();
      const f = Object.fromEntries(new FormData(this).entries());
      if(!window.App.utils.requireFields(f,['no','direction','dep','arr','location','status','segmentId'])){ alert('Заповніть усі обовʼязкові поля'); return; }
      if(!window.App.utils.isValidTime(f.dep) || !window.App.utils.isValidTime(f.arr)){ alert('Невірний формат часу'); return; }
      onSubmit(f, data ? data.no : null);
      App.ui.modal.close();
    });
    App.ui.modal.open({ title: isEdit?'Редагування рейсу':'Новий рейс', content: html });
  }

  App.features.trains = { render };
})(window.App, jQuery, window.App.ui, window.App.utils);
