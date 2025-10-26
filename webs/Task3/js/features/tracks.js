window.App = window.App || {};
window.App.features = window.App.features || {};
(function(App, $, ui){
  function render($root, params={}){
    const state = App.store.get();
    const $view = $('<section class="grid cols-2">');

    // Ліва колонка: перелік ділянок і селектор стану
    const $listCard = $('<div class="card">');
    $listCard.append('<h2>Ділянки колії</h2>');
    const $table = $(`
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Код</th><th>Назва</th><th>Стан</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `);
    const $tb = $table.find('tbody');

    function condSelect(id, val){
      return `
        <select data-id="${id}">
          ${['Норма','Обмеження швидкості','Ремонт'].map(x=>`<option ${x===val?'selected':''}>${x}</option>`).join('')}
        </select>`;
    }
    function renderRows(){
      $tb.empty();
      for(const t of App.store.listTracks()){
        $tb.append(`<tr data-id="${t.id}"><td>${t.id}</td><td>${t.name}</td><td>${condSelect(t.id, t.condition)}</td></tr>`);
      }
    }
    renderRows();
    $listCard.append($table);

    // Права колонка: схема + журнал
    const $right = $('<div class="card">');
    $right.append('<h2>Схема та журнал змін</h2>');
    const map = mapSvg(App.store);
    $right.append(map);
    const $log = $('<ul class="muted" style="margin-top:.75rem"></ul>');
    function renderLog(){
      const logs = App.store.listTrackLogs().slice(0, 10);
      $log.html(logs.length ? logs.map(l=>`<li>${l.id}: ${l.old} → ${l.new} (${new Date(l.at).toLocaleString()})</li>`).join('') : '<li>Журнал порожній</li>');
    }
    renderLog();
    $right.append('<h3>Журнал змін (останні 10)</h3>', $log);

    // Події
    $table.on('change', 'select[data-id]', function(){
      const id = $(this).data('id');
      const val = $(this).val();
      App.store.updateTrackCond(id, val);
      ui.toast.show(`Стан оновлено: ${id} → ${val}`);
    });

    $view.append($listCard, $right);
    $root.append($view);

    // Підсвітка/фільтр: переходили із дашборда?
    if(params.segment){
      const id = params.segment;
      $table.find(`tr[data-id="${id}"] select`).focus();
      // легка підсвітка
      $table.find(`tr[data-id="${id}"]`).addClass('tr-highlight');
      setTimeout(()=> $table.find(`tr[data-id="${id}"]`).removeClass('tr-highlight'), 1500);
    }

    App.store.subscribe(()=>{
      renderRows();
      $right.find('.map').replaceWith(mapSvg(App.store));
      renderLog();
    });
  }

  function mapSvg(store){
    const cond = id => store.getTrackCond(id);
    const cls = c => c==='Норма' ? 'track-ok' : c==='Ремонт' ? 'track-danger' : 'track-warn';
    return $(`
      <div class="map" style="margin-top:.5rem">
        <div class="legend"><span class="mark ok"></span>Норма <span class="mark warn"></span>Обмеження <span class="mark danger"></span>Ремонт</div>
        <svg class="track" viewBox="0 0 600 200" aria-label="Схема (tracks view)">
          <g data-seg="AB"><line x1="40" y1="120" x2="140" y2="120" class="${cls(cond('AB'))}"/></g>
          <g data-seg="BC"><line x1="140" y1="120" x2="240" y2="120" class="${cls(cond('BC'))}"/></g>
          <g data-seg="CD"><line x1="240" y1="120" x2="340" y2="120" class="${cls(cond('CD'))}"/></g>
          <g data-seg="DE"><line x1="340" y1="120" x2="440" y2="120" class="${cls(cond('DE'))}"/></g>
          <g data-seg="EF"><line x1="440" y1="120" x2="540" y2="120" class="${cls(cond('EF'))}"/></g>
          <g data-seg="BY1"><polyline points="240,120 340,60 440,120" class="${cls(cond('BY1'))}" fill="none"/></g>
          <g transform="translate(40,120)"><circle class="station" r="6"/><text class="station-label" x="0" y="20">A</text></g>
          <g transform="translate(140,120)"><circle class="station" r="6"/><text class="station-label" x="0" y="20">B</text></g>
          <g transform="translate(240,120)"><circle class="station" r="6"/><text class="station-label" x="0" y="20">C</text></g>
          <g transform="translate(340,120)"><circle class="station" r="6"/><text class="station-label" x="0" y="20">D</text></g>
          <g transform="translate(440,120)"><circle class="station" r="6"/><text class="station-label" x="0" y="20">E</text></g>
          <g transform="translate(540,120)"><circle class="station" r="6"/><text class="station-label" x="0" y="20">F</text></g>
        </svg>
      </div>
    `);
  }

  App.features.tracks = { render };
})(window.App, jQuery, window.App.ui);
