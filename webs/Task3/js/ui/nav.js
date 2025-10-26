(function ($) {
  $(function () {
    const $btn = $('.nav-toggle');
    const $menu = $('#navMenu');
    if (!$btn.length || !$menu.length) return;

    $btn.on('click', function () {
      const open = $btn.attr('aria-expanded') === 'true';
      $btn.attr('aria-expanded', String(!open));
      $menu.toggleClass('is-open', !open);
    });

    // Закривати меню при навігації
    $(window).on('hashchange', function () {
      $btn.attr('aria-expanded', 'false');
      $menu.removeClass('is-open');
    });
  });
})(jQuery);
