// Candidate-only explicit ownership. Flags do not override native non-axe moves.
export function ownsAxe(f){if(!f?.axePrototype)return false;if(f.axeFinish)return true;if(f.action)return f.action.technique==='axekick';const s=f.axeDisplay;return !!s&&['receive','exit'].includes(s.kind)&&Math.max(0,(f.motionTime||0)-s.startClock)<s.duration;}
export function releaseAxe(f,reason,time){if(f.axeDisplay||f.axeLast)f.axeHandoff={reason,time,from:f.axeLast?structuredClone(f.axeLast):null};delete f.axeDisplay;delete f.axeLast;}
