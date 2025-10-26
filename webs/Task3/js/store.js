window.App = window.App || {};
(function(App, $){
  const LSK = 'sp:v3:store';

  function load(){
    try{
      const raw = localStorage.getItem(LSK);
      if(raw) return JSON.parse(raw);
    }catch(_){}
    return JSON.parse(JSON.stringify(window.V3_SEED));
  }
  function save(state){
    localStorage.setItem(LSK, JSON.stringify(state));
  }

  const state = load();
  const listeners = new Set();

  const Store = {
    get(){ return JSON.parse(JSON.stringify(state)); },
    subscribe(fn){ listeners.add(fn); return ()=>listeners.delete(fn); },
    notify(){ for(const fn of listeners) fn(Store.get()); save(state); },

    // --- Trains ---
    listTrains({q='', status='', segment='', sortKey='', sortDir=1, page=1, pageSize=8}={}){
      const norm = s => String(s||'').toLowerCase();
      let rows = state.trains.filter(t=>{
        let ok = true;
        if(q){ ok = [t.no, t.direction, t.location].some(v => norm(v).includes(norm(q))); }
        if(ok && status){ ok = t.status === status; }
        if(ok && segment){ ok = t.segmentId === segment; }
        return ok;
      });
      if(sortKey){
        rows = rows.slice().sort((a,b)=>{
          const time = k => {
            const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(a[k]); const n = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(b[k]);
            const va = m ? (+m[1])*60 + (+m[2]) : 0; const vb = n ? (+n[1])*60+(+n[2]) : 0;
            return (va - vb) * sortDir;
          };
          if(sortKey==='dep' || sortKey==='arr') return time(sortKey);
          const va = norm(a[sortKey]), vb = norm(b[sortKey]);
          if(va<vb) return -1*sortDir; if(va>vb) return 1*sortDir; return 0;
        });
      }
      const total = rows.length;
      const start = (page-1)*pageSize;
      const paged = rows.slice(start, start+pageSize);
      return { rows:paged, total };
    },
    addTrain(t){
      if(state.trains.some(x => x.no.toLowerCase() === t.no.toLowerCase())) throw new Error('№ має бути унікальним');
      state.trains.push(t); Store.notify();
    },
    updateTrain(no, patch){
      const i = state.trains.findIndex(x => x.no === no);
      if(i<0) return;
      const next = Object.assign({}, state.trains[i], patch);
      // якщо змінюємо № — перевіряємо унікальність
      if(next.no !== no && state.trains.some(x => x.no.toLowerCase() === next.no.toLowerCase()))
        throw new Error('№ має бути унікальним');
      state.trains[i] = next; Store.notify();
    },
    removeTrain(no){
      const i = state.trains.findIndex(x => x.no === no);
      if(i<0) return;
      state.trains.splice(i,1); Store.notify();
    },

    // --- Tracks ---
    listTracks(){ return state.tracks.slice(); },
    getTrackCond(id){ return (state.tracks.find(t=>t.id===id)||{}).condition || '—'; },
    updateTrackCond(id, newCond){
      const t = state.tracks.find(x => x.id === id);
      if(!t) return;
      const old = t.condition;
      if(old === newCond) return;
      t.condition = newCond;
      state.trackLogs.unshift({ id, old, new:newCond, at:new Date().toISOString() });
      state.trackLogs = state.trackLogs.slice(0, 100);
      Store.notify();
    },
    listTrackLogs(){ return state.trackLogs.slice(); }
  };

  App.store = Store;
})(window.App, jQuery);
