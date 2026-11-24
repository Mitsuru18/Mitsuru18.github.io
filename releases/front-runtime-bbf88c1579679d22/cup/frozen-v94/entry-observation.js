// UNADOPTED order fix: only movement already performed in the current microstep.
// No future decisions/actions, rates or movement constraints are changed.
const contexts=new WeakMap(),audit=new WeakMap(),EPS=1e-9;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function log(b,c,stage,extra){if(!b.entryPolicy?.observationAudit)return;let rows=audit.get(b);if(!rows){rows=[];audit.set(b,rows);}rows.push({stage,tick:b.tick,time:b.time,delta:c.delta,baseline:[...c.baseline],positions:b.fighters.map(f=>f.x),poses:b.fighters.map(f=>f.pose),completed:[...c.completed],active:c.active,velocities:[...b.spaceVelocity],caps:[...c.caps],...extra});if(rows.length>128)rows.shift();}
export function beginEntryObservation(b,delta,caps){if(!b.entryPolicy?.enabled||b.entryPolicy?.currentObservation===false){contexts.delete(b);return;}const c={delta,caps:[...caps],baseline:b.fighters.map(f=>f.x),completed:[false,false],active:null};contexts.set(b,c);log(b,c,'microstep-start');}
export function refreshEntryObservation(b,stage='resolved',extra={}){const c=contexts.get(b);if(!c)return;for(let i=0;i<2;i++){const dx=b.fighters[i].x-c.baseline[i];if(c.completed[i]||Math.abs(dx)>EPS)b.spaceVelocity[i]=clamp(dx/c.delta,-c.caps[i],c.caps[i]);}log(b,c,stage,extra);}
export function enterEntryObservationTurn(b,i){const c=contexts.get(b);if(!c)return;if(c.active!==null)c.completed[c.active]=true;c.active=i;refreshEntryObservation(b,'turn-start');}
export function finishEntryObservation(b){const c=contexts.get(b);if(!c)return;c.completed=[true,true];refreshEntryObservation(b,'microstep-finish');}
export const entryObservationLog=b=>structuredClone(audit.get(b)||[]);
