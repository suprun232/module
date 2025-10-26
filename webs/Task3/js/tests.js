(function(App, utils){
  function test(name, fn){
    try{ const res = fn(); console.log('✅', name, res===undefined ? '' : res); return true; }
    catch(e){ console.error('❌', name, e.message); return false; }
  }

  $(function(){
    const results = [];
    results.push(test('validation.isValidTime: 23:59 → true', ()=> { if(!utils.isValidTime('23:59')) throw new Error('expected true'); }));
    results.push(test('validation.isValidTime: 7:10 → false', ()=> { if(utils.isValidTime('7:10')) throw new Error('expected false'); }));
    // Зміна статусу першого рейсу
    const first = App.store.get().trains[0];
    results.push(test('updateTrain: змінюємо статус і відкат', ()=> {
      const orig = first.status;
      App.store.updateTrain(first.no, { status:'Запізнюється' });
      const changed = App.store.get().trains.find(t=>t.no===first.no).status;
      if(changed!=='Запізнюється') throw new Error('не оновилося');
      App.store.updateTrain(first.no, { status:orig }); // відкат
    }));
    // CSV експорт має заголовок
    results.push(test('CSV: містить заголовок "№"', ()=> {
      const { rows } = App.store.listTrains({ page:1, pageSize:5 });
      const csv = utils.csv.toCsv(rows, [{label:'№', value:r=>r.no}]);
      if(!/^"№"/.test(csv)) throw new Error('немає заголовка');
    }));

    const ok = results.every(Boolean);
    console.log(`Тести V3: ${ok ? 'успішно' : 'з помилками'}`);
  });
})(window.App, window.App.utils);
