// Original fixed2D retargeting of manually observed shin-check mechanics.
// Near/camera-side leg is the strike chain in either horizontal facing.
import{params,fromParams,receiverPose,blendParams,clamp}from'./approved-2d-core.js';
export const targetedGuard=id=>id==='midguard'||id==='lowguard';
const ease=q=>{q=clamp(q);return q*q*(3-2*q)};
export function targetedGuardPose(id,elapsed=0){if(!targetedGuard(id))return null;const w=.10,a=.42,r=.22,e=clamp(elapsed,0,w+a+r),weight=e<w?ease(e/w):e<w+a?1:1-ease((e-w-a)/r),p=params(receiverPose()),n={...p,sa:[...p.sa]};if(id==='midguard'){n.nearu=-1.74;n.nearf=.30;n.nearh=.30;n.faru=-1.82;n.farf=.16;n.farh=.16;}else{n.ss=1.50;n.st=1.56;n.kt=.35;n.ks=-1.5;n.kf=.4;n.spine=1.65;n.nearu=-.45;n.nearf=1.50;n.nearh=1.50;n.faru=-.65;n.farf=1.35;n.farh=1.35;}return fromParams(blendParams(p,n,weight));}
