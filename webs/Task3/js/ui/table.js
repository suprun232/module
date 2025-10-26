// js/ui/table.js
window.App = window.App || {};
window.App.ui = window.App.ui || {};
(function (ui, App, $) {
  function Table($container, { columns, getData, pageSize = 8 }) {
    let sortKey = "", sortDir = 1, page = 1;

    const $wrap = $(`
      <div class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr></tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="actions" style="justify-content:space-between;margin-top:.6rem">
          <div class="muted" aria-live="polite"><span id="range"></span></div>
          <div class="actions">
            <button class="btn btn--ghost" data-prev aria-label="Попередня сторінка">«</button>
            <button class="btn btn--ghost" data-next aria-label="Наступна сторінка">»</button>
          </div>
        </div>
      </div>
    `);
    const $thead = $wrap.find("thead tr");
    const $tbody = $wrap.find("tbody");
    const $range = $wrap.find("#range");
    const $btnPrev = $wrap.find("[data-prev]");
    const $btnNext = $wrap.find("[data-next]");

    // Header
    $thead.html(
      columns
        .map((c) => {
          const th = $("<th>").text(c.title);
          if (c.sortKey) {
            th.addClass("sortable")
              .attr("data-sort", c.sortKey)
              .attr("role", "button")
              .attr("tabindex", "0")
              .attr("aria-label", `Сортувати за ${c.title}`);
          }
          return th.prop("outerHTML");
        })
        .join("")
    );

    function render() {
      const { rows, total } = getData({ sortKey, sortDir, page, pageSize });

      // обмежуємо сторінку, якщо даних стало менше
      const pages = Math.max(1, Math.ceil(total / pageSize));
      if (page > pages) page = pages;

      $tbody.empty();
      for (const r of rows) {
        const $tr = $(`<tr data-no="${r.no || ""}" data-seg="${r.segmentId || ""}"></tr>`);
        columns.forEach((c, idx) => {
          // робимо <th scope="row"> для першої колонки (краще для a11y),
          // решта — <td>. Обидва мають data-label для мобільних карток.
          const $cell = idx === 0 ? $("<th scope='row'>") : $("<td>");
          $cell.attr("data-label", c.title);
          $cell.html(c.render ? c.render(r) : (r[c.key] ?? ""));
          $tr.append($cell);
        });
        $tbody.append($tr);
      }

      const start = total ? (page - 1) * pageSize + 1 : 0;
      const end = Math.min(page * pageSize, total);
      $range.text(`${start}–${end} з ${total}`);

      // стан пагінації
      $btnPrev.prop("disabled", page <= 1).attr("aria-disabled", page <= 1);
      $btnNext.prop("disabled", page >= pages).attr("aria-disabled", page >= pages);

      $container.empty().append($wrap);
    }

    // Сортування
    $wrap.on("click keypress", "th.sortable", function (e) {
      if (e.type === "click" || e.key === "Enter" || e.key === " ") {
        const key = $(this).data("sort");
        sortDir = sortKey === key ? -sortDir : 1;
        sortKey = key;
        page = 1;
        render();
      }
    });

    // Пагінація
    $btnPrev.on("click", () => { if (!$btnPrev.prop("disabled")) { page--; render(); } });
    $btnNext.on("click", () => { if (!$btnNext.prop("disabled")) { page++; render(); } });

    render();
    return { refresh: render, setPage(p) { page = p; render(); } };
  }

  ui.Table = Table;
})(window.App.ui, window.App, jQuery);
