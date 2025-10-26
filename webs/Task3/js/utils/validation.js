window.App = window.App || {};
window.App.utils = window.App.utils || {};
(function(utils){
  utils.isValidTime = (s) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(s||'').trim());
  utils.requireFields = (obj, fields) => fields.every(f => String(obj[f]||'').trim().length>0);
})(window.App.utils);
