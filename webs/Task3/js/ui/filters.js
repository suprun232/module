window.App = window.App || {};
window.App.ui = window.App.ui || {};
(function(ui, App, $){
  function createFilters({ tracks, onChange }){
    const $wrap = $(`
      <form class="filters" autocomplete="off">
        <div>
          <label class="sr-only" for="q">Поїзд/№</label>
          <input id="q" type="search" placeholder="IC101, 'Центральна'..." />
        </div>
        <div>
          <label class="sr-only" for="status">Статус</label>
          <select id="status">
            <option value="">Всі статуси</option>
            <option>За розкладом</option>
            <option>Запізнюється</option>
            <option>Скасовано</option>
          </select>
        </div>
        <div>
          <label class="sr-only" for="segment">Ділянка</label>
          <select id="segment">
            <option value="">Всі ділянки</option>
            ${tracks.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
        </div>
      </form>
    `);
    const trigger = ()=> onChange(get());
    function get(){
      return {
        q: $wrap.find('#q').val().trim(),
        status: $wrap.find('#status').val(),
        segment: $wrap.find('#segment').val()
      };
    }
    $wrap.on('input change', 'input,select', trigger);
    return { $el:$wrap, get, set: (o={})=>{
      if('q' in o) $wrap.find('#q').val(o.q);
      if('status' in o) $wrap.find('#status').val(o.status);
      if('segment' in o) $wrap.find('#segment').val(o.segment);
      trigger();
    }};
  }
  ui.filters = { create: createFilters };
})(window.App.ui, window.App, jQuery);
