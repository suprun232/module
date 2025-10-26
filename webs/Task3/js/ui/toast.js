window.App = window.App || {};
window.App.ui = window.App.ui || {};
(function(ui, $){
  const $root = $('#toast-root');
  function show(msg, timeout=2200){
    const $t = $(`<div class="toast" role="status">${msg}</div>`);
    $root.append($t);
    setTimeout(()=> $t.addClass('show'), 10);
    setTimeout(()=> { $t.removeClass('show'); setTimeout(()=> $t.remove(), 200); }, timeout);
  }
  ui.toast = { show };
})(window.App.ui, jQuery);
