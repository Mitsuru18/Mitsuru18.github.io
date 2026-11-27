// Keep the historical production key. Explicit QA URLs never read that key.
export const PUBLIC_SAVE_KEY='world-fighter-journey-v1';
export function saveProfileFor(location){const p=new URLSearchParams(location?.search??'');const qa=p.get('wfj-qa')==='v18';const allowed=['reset','combat','clear','skills','newgame','legacy','expansion'];const scenario=allowed.includes(p.get('scenario'))?p.get('scenario'):'reset';return{qa,scenario,key:qa?PUBLIC_SAVE_KEY+':isolated-qa-v18:'+scenario:PUBLIC_SAVE_KEY};}
export const SAVE_PROFILE=saveProfileFor(globalThis.location);
export const ACTIVE_SAVE_KEY=SAVE_PROFILE.key;
