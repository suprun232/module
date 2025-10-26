window.App = window.App || {};
window.App.utils = window.App.utils || {};
(function(utils){
  function toCsv(rows, headers){
    const esc = v => `"${String(v??'').replace(/"/g,'""')}"`;
    const head = headers.map(h=>esc(h.label)).join(',');
    const body = rows.map(r => headers.map(h=>esc(h.value(r))).join(',')).join('\n');
    return head + '\n' + body + '\n';
  }
  function downloadCsv(filename, csv){
    const blob = new Blob(["\uFEFF"+csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  }
  utils.csv = { toCsv, downloadCsv };
})(window.App.utils);
