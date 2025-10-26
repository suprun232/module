window.App = window.App || {};
window.App.features = window.App.features || {};
(function(App, $, ui){
  function kpis(state){
    const total = state.trains.length;
    const onTime = state.trains.filter(t=>t.status==='За розкладом').length;
    const delayed = state.trains.filter(t=>t.status==='Запізнюється').length;
    const cancelled = state.trains.filter(t=>t.status==='Скасовано').length;
    return { total, onTime, delayed, cancelled };
  }
  function trackClass(cond){
    return cond==='Норма' ? 'track-ok' : (cond==='Ремонт' ? 'track-danger' : 'track-warn');
  }
  function mapSvg(store){
    const cond = id => store.getTrackCond(id);
    return `
      <div class="legend" style="margin-bottom:.5rem">
        <span class="mark ok"></span> Норма
        <span class="mark warn"></span> Обмеження
        <span class="mark danger"></span> Ремонт
      </div>
      <div class="map">
        <svg class="track" viewBox="0 0 600 200" aria-label="Міні‑схема">
          ${seg('AB','A–B',  40,120,140,120, cond('AB'))}
          ${seg('BC','B–C', 140,120,240,120, cond('BC'))}
          ${seg('CD','C–D', 240,120,340,120, cond('CD'))}
          ${seg('DE','D–E', 340,120,440,120, cond('DE'))}
          ${seg('EF','E–F', 440,120,540,120, cond('EF'))}
          ${poly('BY1','Обвідна 1','240,120 340,60 440,120', cond('BY1'))}
          ${station('A',40,120)}${station('B',140,120)}${station('C',240,120)}
          ${station('D',340,120)}${station('E',440,120)}${station('F',540,120)}
        </svg>
      </div>`;
  }
  const seg = (id,label,x1,y1,x2,y2,c) => `<g data-seg="${id}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${trackClass(c)}" /><title>${label} — ${c}</title></g>`;
  const poly = (id,label,points,c) => `<g data-seg="${id}"><polyline points="${points}" class="${trackClass(c)}" fill="none" /><title>${label} — ${c}</title></g>`;
  const station = (n,x,y) => `<g transform="translate(${x},${y})"><circle class="station" r="6"/><text class="station-label" x="0" y="20">${n}</text></g>`;

  function render($root){
    const state = App.store.get();
    const { total, onTime, delayed, cancelled } = kpis(state);
    const $view = $(`
      <section class="grid cols-2">
        <div class="card">
          <h2>Ключові показники</h2>
          <div class="kpis">
            <div class="kpi"><h3>Усього рейсів</h3><div class="val">${total}</div></div>
            <div class="kpi"><h3>За розкладом</h3><div class="val">${onTime}</div></div>
            <div class="kpi"><h3>Із затримкою</h3><div class="val">${delayed}</div></div>
            <div class="kpi"><h3>Скасовано</h3><div class="val">${cancelled}</div></div>
          </div>
        </div>
        <div class="card">
          <h2>Міні‑схема колій</h2>
          ${mapSvg(App.store)}
          <p class="muted">Клік по ділянці відкриє сторінку <b>Tracks</b> з попереднім вибором.</p>
        </div>
        <div class="card">
          <h2>Останні зміни стану колії</h2>
          <ul id="log" class="muted"></ul>
        </div>
        <div class="card">
          <h2>Швидкі дії</h2>
          <div class="actions">
            <a class="btn" href="#/trains">Перейти до рейсів</a>
            <a class="btn btn--ghost" href="#/reports">Звіт (CSV)</a>
          </div>
        </div>
      </section>
    `);
    // Лог змін
    const logs = App.store.listTrackLogs().slice(0,6);
    $view.find('#log').html(logs.length ? logs.map(l=>`<li>${l.id}: ${l.old} → ${l.new} <span class="muted">(${new Date(l.at).toLocaleString()})</span></li>`).join('') : '<li>Змін ще не було</li>');

    // Навігація по кліку на ділянку
    $view.on('click', '[data-seg]', function(){
      const id = $(this).data('seg');
      location.hash = `#/tracks?segment=${encodeURIComponent(id)}`;
    });

    $root.append($view);
  }

  App.features.dashboard = { render };
})(window.App, jQuery, window.App.ui);
