import{HEAD_TRACK}from'./track.js';import{sampleHeadTrack}from'./sample.mjs';import{restoredHairHead}from'./painter.mjs';import{appearancePalette,hairShape}from'./../appearance.js';
const PI=Math.PI,TAU=PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ss=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,q)=>a+(b-a)*q;
// Draw-only angles; never written into battle/pose/save objects. No circular shortest-arc resampling.
export function sweepHeadAngles(p,reference=null){
 const baseline={yaw:PI/2,roll:Number(p.headTilt)||0,pitch:0};
 if(reference?.kind==='ko'){const from=reference.fromAngles??sweepHeadAngles(reference.pose);return{...from,roll:from.roll+(baseline.roll-(Number(reference.pose.headTilt)||0)),join:'captured KO plus existing fall-roll delta'};}
 if(reference?.kind==='return'){const from=sweepHeadAngles(reference.pose),q=ss(reference.q??p.reactionQ??1),end=PI/2+TAU*Math.round((from.yaw-PI/2)/TAU);return{yaw:mix(from.yaw,end,q),roll:mix(from.roll,baseline.roll,q),pitch:mix(from.pitch,0,q),join:'captured head to existing neutral over existing return'};}
 const clock=p.clock;
 if(!clock)return{...baseline,join:'existing neutral fallback'};
 if(clock.stage==='entry'){const to=sampleHeadTrack(HEAD_TRACK,0),q=ss(clock.elapsed/.1);return{yaw:mix(baseline.yaw,to.yaw,q),roll:mix(baseline.roll,to.roll,q),pitch:mix(0,to.pitch,q),join:'existing .1 entry; head only'};}
 if(clock.stage==='return'||clock.stage==='done'){const from=sampleHeadTrack(HEAD_TRACK,112),q=clock.stage==='done'?1:ss((clock.elapsed-(clock.total-.15))/.15);return{yaw:mix(from.yaw,TAU+PI/2,q),roll:mix(from.roll,baseline.roll,q),pitch:mix(from.pitch,0,q),join:'existing .15 return; positive endpoint retained'};}
 const index=Number.isFinite(p.sourceIndex)&&p.sourceIndex>=0&&p.sourceIndex<=112?p.sourceIndex:clock.index;
 return{...sampleHeadTrack(HEAD_TRACK,index),join:'exact product half-index body sample'};
}
const delta=(hex,from,to)=>'#'+hex.slice(1).match(/../g).map((v,i)=>Math.max(0,Math.min(255,parseInt(v,16)+parseInt(to.slice(1+i*2,3+i*2),16)-parseInt(from.slice(1+i*2,3+i*2),16))).toString(16).padStart(2,'0')).join('');
export function paintSweepHead(c,p,{alt=false,appearance=null,flashes=[],reference=null}={}){
 const base=alt?{skin:'#aa7458',light:'#d69a76',shade:'#794f41',cloth:'#773e43',bright:'#a95b58'}:{skin:'#ce956b',light:'#f0bb81',shade:'#9c684c',cloth:'#255660',bright:'#3f7d83'},C=appearancePalette(appearance,base,alt?1:0),angles=sweepHeadAngles(p,reference),customHair=hairShape(C.hairStyle)?.map(v=>v.map(x=>x*1.9))??null,flash=flashes.find(f=>f.target==='head');
 const baseColor=raw=>{let value=raw;if(typeof raw!=='string')return raw;if(raw==='#9c684c')value=C.shade;else if(['#ce956b','#d59c72','#c38b63','#c58c64'].includes(raw))value=delta(raw,'#ce956b',C.skin);if(flash&&/^#[a-fA-F0-9]{6}$/.test(value))value='#'+value.slice(1).match(/../g).map((n,i)=>Math.round(parseInt(n,16)*(1-flash.alpha)+[255,38,56][i]*flash.alpha).toString(16).padStart(2,'0')).join('');return value;};
 const mapped=new Map(),color=raw=>{if(!mapped.has(raw))mapped.set(raw,baseColor(raw));return mapped.get(raw)};
 const part=c.contactPart;c.save();try{c.contactPart='head';restoredHairHead(c,{joints:{head:p.joints.head}},angles.yaw,angles.roll,angles.pitch,{hairOutline:customHair,colorMap:color});}finally{c.restore();c.contactPart=part;}
}

// Existing interruption timestamps and source snapshot supply draw-only continuity.
// No angle fields are added to fighters, battles, saved poses, or runtime admission.
export function sweepHeadReference(f,p,time){
 const r=f.sweepReaction,s=f.interruptedStrike;
 const reaction=(pose,at)=>{if(!pose.reaction||pose.clock)return sweepHeadAngles(pose);const anchor=s?.sweepEntry??r?.pose;if(!anchor||anchor===pose||(!anchor.clock&&!Number.isFinite(anchor.sourceIndex)))return sweepHeadAngles(pose);const start=s?.createdTime??r.createdTime,deadline=r?.deadline??start+(s?.duration??.2);return sweepHeadAngles(pose,{kind:'return',pose:anchor,q:(at-start)/Math.max(1e-9,deadline-start)});};
 if((f.finishSweepKO||f.hp<=0)&&f.sweepKOEntry){const e=f.sweepKOEntry;return{kind:'ko',pose:e.pose,fromAngles:reaction(e.pose,e.createdTime)};}
 if(p.reaction&&r){const anchor=s?.sweepEntry??r.pose,start=s?.createdTime??r.createdTime;return{kind:'return',pose:anchor,q:(time-start)/Math.max(1e-9,r.deadline-start)};}
 return null;
}
