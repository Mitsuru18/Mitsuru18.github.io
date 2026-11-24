export const COURSE_COUNT=12;
export const COURSE_REVISION=2;
export const EXTRA_LESSONS=Object.freeze({us:{skill:'uppercut',name:'オーウェン・ヴェイル',place:'ニューヨーク・アッパーの道場'},jp:{skill:'midguard',name:'田中 直樹',place:'京都・胴守りの道場'},th:{skill:'lowguard',name:'チャイワット・シラ',place:'バンコク・脚守りの道場'},kr:{skill:'axekick',name:'カン・ジュンソク',place:'ソウル・踵落としの道場'}});
export const courseCount=country=>COURSE_COUNT+(EXTRA_LESSONS[country]?1:0);
export const totalCourseCount=()=>11*COURSE_COUNT+Object.keys(EXTRA_LESSONS).length;
export const LESSON_INDICES=Object.freeze([2,5,8,11]);
export const COURSE_ROLES=['street-opening','street-body','strike-a','street-head','street-low','defense','street-guard','street-range','strike-b','street-speed','street-mix','strike-c'];
export const venueKind=index=>(LESSON_INDICES.includes(index)||index===12)?'dojo':'street';
// Existing opaque IDs retain their original indices so earned wins never move.
export const DEFENSE_REWARD={jp:'guard',th:'sway',br:'crouch',kr:'jump',fr:'guard',us:'sway'};
export const courseId=(country,index)=>[0,6,9].includes(index)?`${country}-dojo-${[0,6,9].indexOf(index)}`:`${country}-stage-${index}`;
export const courseIds=country=>Array.from({length:courseCount(country)},(_,i)=>courseId(country,i));
export const courseIndex=id=>{const m=typeof id==='string'&&id.match(/^[a-z]{2}-(dojo|stage)-(\d+)$/);if(!m)return -1;const n=Number(m[2]);return m[1]==='dojo'?[0,6,9][n]??-1:(COURSE_ROLES[n]||n===12&&EXTRA_LESSONS[id.slice(0,2)])&&![0,6,9].includes(n)?n:-1;};
