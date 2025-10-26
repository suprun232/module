window.App = window.App || {};
window.App.features = window.App.features || {};
(function(App, $, ui, utils){
  function render($root){
    const state = App.store.get();
    const filters = ui.filters.create({
      tracks: state.tracks,
      onChange: ()=>{}
    });

    const $card = $('<section class="card">');
    $card.append('<h2>Звіти (CSV)</h2>');
    $card.append(filters.$el);

    const $btn = $('<button class="btn" style="margin-top:.75rem">Сформувати CSV</button>');
    $card.append($btn);

    $btn.on('click', ()=>{
      const q = filters.get();
      const { rows } = App.store.listTrains({ ...q, page:1, pageSize: 100000 }); // все за фільтром
      const headers = [
        { label:'№', value: r=>r.no },
        { label:'Напрямок', value: r=>r.direction },
        { label:'Відправлення', value: r=>r.dep },
        { label:'Прибуття', value: r=>r.arr },
        { label:'Поточне місце', value: r=>r.location },
        { label:'Ділянка', value: r=>r.segmentId },
        { label:'Статус', value: r=>r.status },
        { label:'Стан колії', value: r=>App.store.getTrackCond(r.segmentId) }
      ];
      const csv = utils.csv.toCsv(rows, headers);
      utils.csv.downloadCsv('trains_report.csv', csv);
      ui.toast.show(`Згенеровано ${rows.length} рядків`);
    });

    $root.append($card);
  }
  App.features.reports = { render };
})(window.App, jQuery, window.App.ui, window.App.utils);
