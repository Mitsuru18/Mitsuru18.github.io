// One generated root family; original local poses and source clock are untouched.
import {jumpPose as basePose} from './jump-base-motion.js';
export const ROOT_ADAPTATION_REVISION='jump-root-air-r55-v1';
const sf=1001/30000,ramp=sf/4,t0=.22+35*sf,t1=.22+43*sf;
export const AIR_START=t0,AIR_END=t1;
export const ROOT_SEGMENTS=Array.from({length:8},(_,i)=>{const a=t0+i*sf,z=t0+(i+1)*sf,v=(basePose(z).rootWorld-basePose(a).rootWorld)/sf;if(v<0)throw Error('R54 root family requires nonnegative source segment');return{source:925+i,a,z,v,area:v*(sf-([0,7].includes(i)?ramp/2:0))};});
export const ROOT_ADAPTATION_CAP=ROOT_SEGMENTS.reduce((n,s)=>n+s.area,0);
export function rootCorrection(t,c){if(c===undefined)return 0;if(c?.revision!==ROOT_ADAPTATION_REVISION||!Number.isFinite(c.amount)||c.amount<0||c.amount>ROOT_ADAPTATION_CAP)throw Error('Unknown or invalid R54 root adaptation');if(t<=t0)return 0;if(t>=t1)return c.amount;const area=ROOT_SEGMENTS.reduce((n,s,i)=>{const x=Math.max(0,Math.min(sf,t-s.a));return n+s.v*(i===0?(x<ramp?x/2-ramp*Math.sin(Math.PI*x/ramp)/(2*Math.PI):x-ramp/2):i===7?(x<=sf-ramp?x:(sf-ramp)+(x-(sf-ramp))/2+ramp*Math.sin(Math.PI*(x-(sf-ramp))/ramp)/(2*Math.PI)):x);},0);return c.amount*area/ROOT_ADAPTATION_CAP;}
