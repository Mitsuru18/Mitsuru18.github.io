import{fourTraceFootRegistration}from'./../four-trace-painter.js';
const FOOT_PALETTE={skin:'#c8916e',light:'#e8b18a',shade:'#996448',cloth:'#23565c',bright:'#43828a',wrap:'#eee6d3',hair:'#292a2c'};
import{physicalCommon,heelContact}from'./runtime.js';
import{fourTraceStanding,fourTraceRigTransition,fourTraceFootArt}from'./../four-trace-motion.js';
export function axeCommonRig(j){return fourTraceRigTransition('jab',fourTraceStanding('jab').rig,physicalCommon(j),1);}
export function drawnAxeHeelContact(a,d,gap,af=1,df=-1){const art=fourTraceFootRegistration(axeCommonRig(a),'right',FOOT_PALETTE).art,j={...a,strike_heel:[art.heel.x,-art.heel.y],strike_toe:[art.toe.x,-art.toe.y]},c=heelContact(j,d,gap,af,df);return{...c,geometry:'Existing v70 resolved foot-art anchor heel-quarter against unchanged head ellipse; foot art transform shared, full contour not certified',sourceJointHeel:a.strike_heel,drawnHeel:j.strike_heel,drawnToe:j.strike_toe};}
