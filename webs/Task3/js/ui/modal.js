window.App = window.App || {};
window.App.ui = window.App.ui || {};
(function(ui, $){
  let $root = $('#modal-root');

  function open({ title='Модальне вікно', content='', onClose=null }){
    close(); // гарантія одного модального
    const $backdrop = $(`
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal">
          <header>
            <h3 id="modal-title">${title}</h3>
            <button class="close" aria-label="Закрити">✕</button>
          </header>
          <div class="modal-body"></div>
        </div>
      </div>
    `);
    $backdrop.find('.modal-body').append(content);
    $backdrop.on('click', (e)=>{ if(e.target === e.currentTarget) close(); });
    $backdrop.find('.close').on('click', close);
    $root.append($backdrop);
    setTimeout(()=> $backdrop.find('.close').focus(), 0);
    $backdrop.data('onClose', onClose);
  }
  function close(){
    const $bd = $root.find('.modal-backdrop');
    if($bd.length){
      const onClose = $bd.data('onClose');
      $bd.remove();
      if(typeof onClose === 'function') onClose();
    }
  }
  ui.modal = { open, close };
})(window.App.ui, jQuery);
