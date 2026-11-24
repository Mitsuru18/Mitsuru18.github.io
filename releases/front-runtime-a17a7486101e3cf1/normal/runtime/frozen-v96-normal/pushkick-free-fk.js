// QA preparation only. Not connected to product. Params-compatible free FK.
// No floor snapping, reach clipping, inferred observations or source timing.
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]], mul=(a,n)=>a.map(v=>v*n), vec=a=>[Math.cos(a),Math.sin(a)];
export const ANGLE_KEYS=['ss','st','hip','spine','head','kt','ks','shoulders','sf','kf','nearu','nearf','nearh','faru','farf','farh'];
export function validateParams(p){
 if(!p||!Array.isArray(p.sa)||p.sa.length!==2||!p.sa.every(Number.isFinite))throw Error('sa must be two finite coordinates');
 for(const k of ANGLE_KEYS)if(!Number.isFinite(p[k]))throw Error('Missing/nonfinite angle: '+k);
 for(const k of ['sn','kn'])if(p[k]!==1&&p[k]!==-1)throw Error(k+' must be +1 or -1');
 return p;
}
function sole(a,t,n){const u=vec(t),up=mul([-u[1],u[0]],n);return[add(add(a,mul(u,-4)),mul(up,-3)),add(add(a,mul(u,6.9)),mul(up,-3))]}
export function freeFK(p){
 validateParams(p);const j={support_ankle:[...p.sa]};
 j.support_knee=add(j.support_ankle,mul(vec(p.ss),25));
 j.support_hip=add(j.support_knee,mul(vec(p.st),26));
 j.strike_hip=add(j.support_hip,mul(vec(p.hip),8));
 j.center=mul(add(j.support_hip,j.strike_hip),.5);
 j.chest=add(j.center,mul(vec(p.spine),30));j.head=add(j.chest,mul(vec(p.head),14));
 j.strike_knee=add(j.strike_hip,mul(vec(p.kt),26));j.strike_ankle=add(j.strike_knee,mul(vec(p.ks),25));
 [j.support_heel,j.support_toe]=sole(j.support_ankle,p.sf,p.sn);
 [j.strike_heel,j.strike_toe]=sole(j.strike_ankle,p.kf,p.kn);
 for(const s of ['near','far']){j[s+'_shoulder']=add(j.chest,mul(vec(p.shoulders),s==='near'?-4:4));j[s+'_elbow']=add(j[s+'_shoulder'],mul(vec(p[s+'u']),18));j[s+'_wrist']=add(j[s+'_elbow'],mul(vec(p[s+'f']),17));j[s+'_hand']=add(j[s+'_wrist'],mul(vec(p[s+'h']),3.5))}
 return j;
}
export function blendFreeParams(a,b,q){
 validateParams(a);validateParams(b);if(!Number.isFinite(q)||q<0||q>1)throw Error('q outside [0,1]');
 if(a.sn!==b.sn||a.kn!==b.kn)throw Error('Foot normal branch change requires explicit resolution');
 const p={sa:a.sa.map((v,i)=>v+(b.sa[i]-v)*q),sn:a.sn,kn:a.kn};
 for(const k of ANGLE_KEYS)p[k]=a[k]+Math.atan2(Math.sin(b[k]-a[k]),Math.cos(b[k]-a[k]))*q;
 return p;
}
// Samples only supplied, fully prepared/adapted records; never fills raw observation nulls.
export function samplePreparedFrames(frames,t){
 if(!Array.isArray(frames)||!frames.length||!Number.isFinite(t))throw Error('Invalid sample input');
 for(let i=0;i<frames.length;i++){const f=frames[i];if(!Number.isFinite(f.gameTime)||(i&&f.gameTime<=frames[i-1].gameTime))throw Error('gameTime must increase strictly');validateParams(f.params)}
 const tc=Math.max(frames[0].gameTime,Math.min(frames.at(-1).gameTime,t));
 let i=0;while(i+1<frames.length&&frames[i+1].gameTime<tc)i++;
 const a=frames[i],b=frames[Math.min(i+1,frames.length-1)],q=a===b?0:(tc-a.gameTime)/(b.gameTime-a.gameTime);
 const p=blendFreeParams(a.params,b.params,q);
 return {joints:freeFK(p),params:p,sourceRefs:[a.sourceRef,b.sourceRef],fraction:q,gameTime:tc};
}
