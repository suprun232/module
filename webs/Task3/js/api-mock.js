window.V3_SEED = {
  tracks: [
    { id:'AB',  name:'A–B',        condition:'Норма' },
    { id:'BC',  name:'B–C',        condition:'Обмеження швидкості' },
    { id:'CD',  name:'C–D',        condition:'Ремонт' },
    { id:'DE',  name:'D–E',        condition:'Норма' },
    { id:'EF',  name:'E–F',        condition:'Норма' },
    { id:'BY1', name:'Обвідна 1',  condition:'Обмеження швидкості' }
  ],
  trains: [
    { no:'IC101', direction:'Центральна → Південна', dep:'06:15', arr:'08:45', location:'Ділянка A–B', segmentId:'AB',  status:'За розкладом' },
    { no:'R204',  direction:'Північна → Центральна', dep:'06:50', arr:'09:20', location:'Станція B',    segmentId:'BC',  status:'Запізнюється' },
    { no:'IC305', direction:'Західна → Південна',     dep:'07:10', arr:'09:55', location:'Ділянка C–D', segmentId:'CD',  status:'Скасовано' },
    { no:'R406',  direction:'Східна → Центральна',    dep:'07:25', arr:'10:05', location:'Ділянка D–E', segmentId:'DE',  status:'За розкладом' },
    { no:'IC507', direction:'Південна → Центральна',  dep:'07:40', arr:'10:20', location:'Ділянка B–C', segmentId:'BC',  status:'Запізнюється' },
    { no:'R608',  direction:'Центральна → Східна',    dep:'08:05', arr:'10:30', location:'Станція D',    segmentId:'DE',  status:'За розкладом' },
    { no:'IC709', direction:'Північна → Західна',     dep:'08:20', arr:'11:50', location:'Обвідна 1',    segmentId:'BY1', status:'Запізнюється' },
    { no:'R810',  direction:'Центральна → Північна',  dep:'08:45', arr:'11:10', location:'Ділянка E–F', segmentId:'EF',  status:'За розкладом' },
    { no:'IC911', direction:'Західна → Центральна',   dep:'09:00', arr:'11:35', location:'Ділянка C–D', segmentId:'CD',  status:'За розкладом' },
    { no:'R012',  direction:'Південна → Східна',      dep:'09:20', arr:'12:05', location:'Станція E',    segmentId:'EF',  status:'За розкладом' }
  ],
  trackLogs: [] // {id:'CD', old:'Ремонт', new:'Норма', at:'2025-10-26T10:05:00Z'}
};
