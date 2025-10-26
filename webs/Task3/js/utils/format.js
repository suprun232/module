window.App = window.App || {};
window.App.utils = window.App.utils || {};
(function(utils){
  utils.badge = (status) => {
    const cls = status==='За розкладом'?'ok':status==='Запізнюється'?'late':'cancel';
    return `<span class="badge ${cls}">${status}</span>`;
  };
})(window.App.utils);
