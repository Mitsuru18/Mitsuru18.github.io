import * as P from './progression.js';
import {preflightMainRuntimeRaw,assertMainRuntimeState,resolveBattleRuntime} from './battle-runtime-contract.js';
export * from './progression.js';
export function loadSave(raw){preflightMainRuntimeRaw(raw);const s=P.loadSave(raw);if(s)assertMainRuntimeState(s,{bindPublic:true});return s;}
export function saveGame(s){assertMainRuntimeState(s);return P.saveGame(s);}
export function settleFight(s,ticket,b){assertMainRuntimeState(s);resolveBattleRuntime(b,'normal');return P.settleFight(s,ticket,b);}
