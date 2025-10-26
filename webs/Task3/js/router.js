window.App = window.App || {};
(function(App, $){
  const $view = $('#view');
  const VALID = ['#/dashboard','#/trains','#/tracks','#/reports'];

  function parseHash(){
    let h = location.hash || '#/dashboard';
    // Ігноруємо службові якірці типу #app
    if (h === '#app') h = '#/dashboard';
    const [path0, query=''] = h.split('?');
    const path = VALID.includes(path0) ? path0 : '#/dashboard';
    const params = {};
    query.split('&').filter(Boolean).forEach(p=>{
      const [k,v=''] = p.split('=');
      params[decodeURIComponent(k)] = decodeURIComponent(v);
    });
    return { path, params };
  }

  function setActiveNav(path){
    $('[data-route]').each(function(){
      const isActive = $(this).attr('href') === path;
      $(this).attr('aria-current', isActive ? 'page' : null);
    });
  }

  // Фічу беремо ДИНАМІЧНО, а не зі знімка під час завантаження
  function getFeature(path){
    const f = (App.features || {});
    if (path === '#/trains')  return f.trains;
    if (path === '#/tracks')  return f.tracks;
    if (path === '#/reports') return f.reports;
    return f.dashboard;
  }

  function render(){
    const { path, params } = parseHash();
    const feature = getFeature(path);
    setActiveNav(path);
    $view.empty();

    if (feature && typeof feature.render === 'function') {
      feature.render($view, params);
    } else {
      // Якщо фічі ще не встигли завантажитися — спробувати знову наприкінці черги
      $view.html('<div class="card"><p class="muted">Завантаження…</p></div>');
      setTimeout(render, 0);
      return;
    }
    setTimeout(()=>{ $view.focus(); }, 0);
  }

  $(window).on('hashchange', render);
  $(function(){
    if (!location.hash || location.hash === '#app') location.hash = '#/dashboard';
    render();
  });

  App.router = { render };
})(window.App, jQuery);
