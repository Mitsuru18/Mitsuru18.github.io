// ISOLATED LOCAL PREVIEW ART ONLY. No gameplay imports or side effects.
// Verbatim drawing functions from the locally held historic v58 renderer.
// This is not the current published v61. No existing source file is edited.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const pt=(x,y)=>({x,y}),lerp=(a,b,t)=>pt(mix(a.x,b.x,t),mix(a.y,b.y,t));
const pal=[{skin:'#c8916e',light:'#e8b18a',shade:'#996448',cloth:'#23565c',bright:'#43828a',wrap:'#eee6d3',hair:'#292a2c'},{skin:'#a56c50',light:'#ca8e67',shade:'#724536',cloth:'#883e42',bright:'#b45952',wrap:'#e8d7ba',hair:'#24252a'}];
function hairShape(style){return style==='buzz'?[[-5,0],[-6,-3],[-4,-6],[1,-7],[5,-4],[5,-2],[0,-4],[-3,-3]]:style==='swept'?[[-5,2],[-6,-3],[-5,-7],[-1,-10],[0,-7],[5,-9],[5,-4],[1,-3],[-3,-2],[-3,2]]:style==='tied'?[[-5,4],[-6,-3],[-4,-7],[1,-8],[5,-5],[4,-3],[-1,-4],[-3,0],[-4,5],[-7,9],[-9,8],[-8,3]]:null;}
function path(c,points,fill,stroke='#253039',width=.65){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,a,b,color,w){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function oval(c,x,y,rx,ry,color,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=color;c.fill();}
function ik(a,target,l1,l2,bend=1){let dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy)||.001;let reach=clamp(d,Math.abs(l1-l2)+.7,l1+l2-.7);dx/=d;dy/=d;let along=(l1*l1-l2*l2+reach*reach)/(2*reach),h=Math.sqrt(Math.max(0,l1*l1-along*along));return {a,b:pt(a.x+dx*along-dy*h*bend,a.y+dy*along+dx*h*bend),c:pt(a.x+dx*reach,a.y+dy*reach)};}
function segment(c,a,b,r1,r2,color,light,shade){let dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.001){oval(c,a.x,a.y,Math.max(r1,r2),Math.max(r1,r2),color);return;}let nx=-dy/len,ny=dx/len;c.beginPath();c.moveTo(a.x+nx*r1,a.y+ny*r1);c.bezierCurveTo(a.x+dx*.38+nx*r1,a.y+dy*.38+ny*r1,b.x+nx*r2,b.y+ny*r2,b.x+nx*r2,b.y+ny*r2);c.quadraticCurveTo(b.x+dx/len*r2,b.y+dy/len*r2,b.x-nx*r2,b.y-ny*r2);c.bezierCurveTo(a.x+dx*.35-nx*r1,a.y+dy*.35-ny*r1,a.x-nx*r1,a.y-ny*r1,a.x-nx*r1,a.y-ny*r1);c.quadraticCurveTo(a.x-dx/len*r1,a.y-dy/len*r1,a.x+nx*r1,a.y+ny*r1);c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#2b3035';c.lineWidth=.55;c.stroke();line(c,lerp(a,b,.2),lerp(a,b,.73),light,r2*.46);if(shade)line(c,pt(a.x-nx*r1*.6,a.y-ny*r1*.6),pt(b.x-nx*r2*.7,b.y-ny*r2*.7),shade,.6);}
function foot(c,p,angle,P,far,pivot=0,pointed=0,projection=1){c.save();c.translate(p.x,p.y);c.rotate(angle);const foreshorten=mix(1,-1,pivot);c.scale((foreshorten<0?-1:1)*Math.max(.24,Math.abs(foreshorten))*projection,1);if(pointed>.01){
 // A plantar-flexed bare foot, not the standing foot rotated into a spear.
 // Rounded heel, instep and toe pads remain attached to the actual IK ankle.
 c.beginPath();c.moveTo(-2,-2);c.bezierCurveTo(1,-2.1,3,-.9,5.2,-1.2);c.quadraticCurveTo(8.4,-1.6,9,.3);c.quadraticCurveTo(9.8,2.1,7.7,2.7);c.quadraticCurveTo(5.8,3.1,3.8,2.1);c.quadraticCurveTo(1.2,1.4,-.7,3.1);c.quadraticCurveTo(-3.5,3.8,-3.2,.9);c.quadraticCurveTo(-3.1,-.8,-2,-2);c.closePath();c.fillStyle=far?P.shade:P.skin;c.fill();c.strokeStyle='#253039';c.lineWidth=.55;c.stroke();line(c,pt(1,-.8),pt(6.5,-.1),P.light,.7);line(c,pt(7.4,.3),pt(7.7,1.5),P.shade,.45);
 }else{path(c,[pt(-3,-2),pt(2,-2),pt(4,0),pt(9,1),pt(10,3),pt(-4,3)],far?P.shade:P.skin);line(c,pt(3,1),pt(8,2),P.light,.7);}c.restore();}
function continuousSupportFoot(c,p,angle,P,far,pivot){
 const scale=1-2*pivot;c.save();c.translate(p.x,p.y);c.rotate(angle);
 if(Math.abs(scale)<.28){const alpha=1-smooth(Math.abs(scale)/.28);c.save();c.globalAlpha*=alpha;oval(c,0,1,2.3,1.8,far?P.shade:P.skin);c.restore();}
 if(Math.abs(scale)>1e-7){c.scale(scale,1);foot(c,pt(0,0),0,P,far);}c.restore();
}
function leg(c,hip,target,P,far,angle=0,pivot=0,pointed=0,chain=null,continuous=false){const s=chain||ik(hip,target,26,25,-1);const skin=P.outfit==='gi'?(far?P.cloth:P.bright):(far?P.shade:P.skin),light=P.outfit==='gi'?P.bright:(far?P.skin:P.light);
 const thigh=()=>segment(c,s.a,s.b,5.5,3.6,skin,light,P.shade),shin=()=>segment(c,s.b,s.c,3.5,2.1,skin,light,P.shade),shorts=()=>segment(c,s.a,lerp(s.a,s.b,.53),6,5.1,far?P.cloth:P.bright,P.cloth),end=()=>{const wrap=lerp(s.b,s.c,.88);segment(c,wrap,s.c,2.3,2.1,P.wrap,'#fff5de');const footAngle=mix(angle,Math.atan2(s.c.y-s.b.y,s.c.x-s.b.x)+.08,pointed);if(continuous)continuousSupportFoot(c,s.c,footAngle,P,far,pivot);else foot(c,s.c,footAngle,P,far,pivot,pointed,s.footProjection??1);};
 // A source-hidden lower leg is still connected, but lies behind its nearer
 // thigh and the torso. Never expose a collapsing invented foot at the knee.
 thigh();shin();shorts();end();
 // Only the overlapping upper-thigh volume is brought forward gradually;
 // the connected lower limb never fades out or changes order in one tick.
 if(s.occludedShinWeight>0){c.save();c.globalAlpha*=s.occludedShinWeight;thigh();shorts();c.restore();}return s;}
function hand(c,p,elbow,P,far){let a=Math.atan2(p.y-elbow.y,p.x-elbow.x);c.save();c.translate(p.x,p.y);c.rotate(a);path(c,[pt(-2,-2.7),pt(1.5,-3),pt(4,-1.8),pt(4,1.7),pt(1,3),pt(-2,2.2)],far?P.shade:P.skin);line(c,pt(1,-2),pt(1,1),P.shade,.5);c.restore();}
function arm(c,shoulder,target,P,far,bend=1,chain=null){let s=chain||ik(shoulder,target,18,17,bend),skin=far?P.shade:P.skin;segment(c,s.a,s.b,3.8,2.7,skin,far?P.skin:P.light,P.shade);if(['tee','gi'].includes(P.outfit))segment(c,s.a,lerp(s.a,s.b,P.outfit==='gi'?1:.48),3.9,3,far?P.cloth:P.bright,P.cloth);segment(c,s.b,s.c,2.9,1.8,P.outfit==='gi'?(far?P.cloth:P.bright):skin,far?P.skin:P.light,P.shade);segment(c,lerp(s.b,s.c,.72),s.c,2.2,2.2,P.wrap,'#fff4dd');hand(c,s.c,s.b,P,far);}
function upperBodyRig(o){
 const turn=o.bodyTurn||0,spin=o.spinWeight||0,yaw=o.spinYaw||0,cos=Math.cos(yaw),sin=Math.sin(yaw);
 const fit=p=>{if(!o.shoulderFit)return p;const root=pt(o.chest.x,o.chest.y+1),dx=p.x-root.x,dy=p.y-root.y,d=Math.hypot(dx,dy);return d<=6?p:lerp(p,pt(root.x+dx*6/d,root.y+dy*6/d),o.shoulderFit);};
 return {nearShoulder:fit(pt(o.chest.x+mix(4-8*turn,4*cos,spin),o.chest.y+2+2*sin*spin)),farShoulder:fit(pt(o.chest.x+mix(-4+9.5*turn,-4*cos,spin),o.chest.y+2-6*turn-2*sin*spin)),
  nearHip:pt(o.hip.x+mix(3-6*turn,3*cos,spin),o.hip.y),farHip:pt(o.hip.x+mix(-3+6*turn,-3*cos,spin),o.hip.y+1)};
}
function torso(c,o,P,outfit=P){const h=o.hip,s=o.chest,dx=s.x-h.x,dy=s.y-h.y,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;const turn=o.bodyTurn||0,spin=o.spinWeight||0,yaw=o.spinYaw||0,back=spin>.5&&Math.cos(yaw)<-.2,width=(1-Math.abs(turn)*.25)*mix(1,.55+.45*Math.abs(Math.cos(yaw)),spin);const at=(p,w)=>pt(p.x+nx*w*width,p.y+ny*w*width);path(c,[at(s,-7),pt(s.x-3,s.y-3),at(s,9),at(lerp(s,h,.32),9),at(h,6),pt(h.x,h.y+5),at(h,-6),at(lerp(s,h,.3),-8)],P.outfit&&P.outfit!=='shorts'?P.bright:P.skin);const side=mix(mix(-1,1,clamp(turn)),-Math.cos(yaw),spin);path(c,[at(s,7*side),at(lerp(s,h,.5),6*side),at(h,6*side),at(h,side),at(lerp(s,h,.55),2*side),at(s,2*side)],P.outfit&&P.outfit!=='shorts'?P.cloth:P.shade,null);if(P.outfit&&P.outfit!=='shorts'){line(c,pt(s.x-4,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);line(c,pt(s.x+5,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);}else if(back){line(c,pt(s.x,s.y+4),pt(h.x,h.y-8),P.shade,.7);line(c,pt(s.x-5,s.y+5),pt(s.x-2,s.y+12),P.shade,.65);line(c,pt(s.x+5,s.y+5),pt(s.x+2,s.y+12),P.shade,.65);}else{line(c,pt(s.x+2,s.y+7),pt(s.x+6,s.y+8),P.shade,.7);line(c,pt(s.x+2,s.y+8),pt(h.x+2,h.y-9),'#b37a58',.6);line(c,lerp(pt(h.x+2,h.y-8),at(lerp(s,h,.78),.5),o.shoulderFit||0),lerp(pt(h.x+5,h.y-7),at(lerp(s,h,.81),2.5),o.shoulderFit||0),P.shade,.5);}/* Rounded pelvis cloth replaces the detached rectangular overlay; pose and leg attachments stay intact. */path(c,[[-7,-3],[7,-3],[7.7,-1.5],[8,.4],[7.4,2.9],[5.5,5.1],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),outfit.bright,null);path(c,[[-7,-3],[-5.6,-2.3],[-5.2,1.1],[-3.4,5.9],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),outfit.cloth,null);line(c,pt(h.x-7,h.y-2),pt(h.x+7,h.y-2),outfit.accent||outfit.wrap,2);if(!back)line(c,pt(h.x+2-5*turn,h.y-1),pt(h.x+3-5*turn,h.y+5),outfit.wrap,1);}
function head(c,h,s,P,turn,spinYaw=0,spinWeight=0){segment(c,pt(s.x,s.y+1),pt(h.x-1,h.y+5),3.1,2.8,P.skin,P.light);c.save();c.translate(h.x,h.y);if(spinWeight>.5&&Math.cos(spinYaw)<-.25){path(c,[pt(-5,-5),pt(0,-8),pt(5,-5),pt(6,2),pt(3,7),pt(-3,7),pt(-6,2)],P.skin);path(c,[pt(-6,2),pt(-6,-3),pt(-3,-7),pt(2,-8),pt(6,-4),pt(6,3),pt(3,5),pt(0,3),pt(-3,5)],P.hair);line(c,pt(-3,6),pt(3,6),P.shade,.7);c.restore();return;}if(spinWeight>.5?Math.sin(spinYaw)>.3:turn>1.4)c.scale(-1,1);c.rotate(Math.atan2(s.x-h.x,Math.abs(s.y-h.y))*.25+(P.axeHeadRoll||0));path(c,[pt(-5,-6),pt(1,-7),pt(5,-4),pt(5,0),pt(7,2),pt(5,3),pt(5,6),pt(1,8),pt(-3,6),pt(-5,2)],P.skin);path(c,(hairShape(P.hairStyle)||[[-5,2],[-6,-2],[-5,-6],[-1,-8],[3,-7],[5,-4],[1,-4],[-1,-2],[-3,-2],[-3,2]]).map(p=>pt(...p)),P.hair);oval(c,-2,1,1.5,2,P.light);line(c,pt(2,-1),pt(4,-.6),'#343036',.8);line(c,pt(3,4),pt(5,4),P.shade,.6);line(c,pt(0,6),pt(3,6),P.shade,.7);c.restore();}
function spinHead(c,o,P){
 if(o.headView!=='front'){
  const yaw=o.headView.includes('back')?Math.PI:o.headView.includes('left')?Math.PI/2:0;
  return head(c,o.head,o.chest,P,0,yaw,o.weight);
 }
 const h=o.head,s=o.chest;segment(c,pt(s.x,s.y+1),pt(h.x,h.y+5),3.1,2.8,P.skin,P.light);c.save();c.translate(h.x,h.y);
 path(c,[pt(-5,-5),pt(0,-7),pt(5,-5),pt(6,1),pt(4,6),pt(0,8),pt(-4,6),pt(-6,1)],P.skin);
 path(c,[pt(-6,2),pt(-6,-3),pt(-3,-7),pt(1,-8),pt(5,-5),pt(6,1),pt(3,-3),pt(0,-2),pt(-3,-3),pt(-3,2)],P.hair);
 line(c,pt(-3,-.5),pt(-1,-.4),'#343036',.8);line(c,pt(1,-.4),pt(3,-.5),'#343036',.8);line(c,pt(0,0),pt(1,3),P.shade,.6);line(c,pt(-1,5),pt(2,5),P.shade,.6);c.restore();
}
function spinFootProjection(ankle,heel,toe){
 const dx=toe.x-heel.x,dy=toe.y-heel.y,len=Math.hypot(dx,dy),mid=lerp(heel,toe,.5),cap=Math.min(1,16/(len||1));
 const ux=dx*cap/14,uy=dy*cap/14,along=((ankle.x-mid.x)*dx+(ankle.y-mid.y)*dy)/Math.max(4,len*len);
 const nx=mid.x-ankle.x+dx*along,ny=mid.y-ankle.y+dy*along,height=Math.hypot(nx,ny),thickness=Math.min(1,4.5/(height||1));
 const vx=nx*thickness/3,vy=ny*thickness/3;
 return {ux,uy,vx,vy,x:mid.x-3*ux-3*vx,y:mid.y-3*uy-3*vy,
  heel:pt(mid.x-7*ux,mid.y-7*uy),toe:pt(mid.x+7*ux,mid.y+7*uy),
  roundness:1-smooth(Math.min(len/7,height/2.3))};
}
function spinFoot(c,p,side,P,far){
 const ankle=p[side+'Ankle'],heel=p[side+'Heel'],toe=p[side+'Toe'];if(!ankle)return;
 if(heel&&toe){
  const f=spinFootProjection(ankle,heel,toe);
  // The ankle-to-instep attachment is anatomical, not a fading projection
  // accent. At idle this lies entirely inside the original foot artwork.
  segment(c,ankle,pt(f.x,f.y),1.8,1.8,far?P.shade:P.skin,P.light,P.shade);
  if(f.roundness>.001){c.save();c.globalAlpha*=f.roundness;segment(c,pt(f.x,f.y),lerp(f.heel,f.toe,.45),2,1.8,far?P.shade:P.skin,P.light,P.shade);segment(c,f.heel,f.toe,2,1.7,far?P.shade:P.skin,P.light,P.shade);c.restore();}
  if(Math.abs(f.ux*f.vy-f.uy*f.vx)>1e-7){c.save();c.transform(f.ux,f.uy,f.vx,f.vy,f.x,f.y);foot(c,pt(0,0),0,P,far);c.restore();}
 }else if(toe){segment(c,ankle,toe,2.3,1.8,far?P.shade:P.skin,P.light,P.shade);}
 else { // Only the ankle/heel envelope is visible; do not invent a toe direction.
  oval(c,ankle.x,ankle.y,2.7,2.1,far?P.shade:P.skin);oval(c,ankle.x-.5,ankle.y-.5,1.3,.8,P.light);
 }
}
export { path, line, oval, ik, segment, foot, continuousSupportFoot, leg, hand, arm, upperBodyRig, torso, head, spinHead, spinFootProjection, spinFoot, pal as characterPalettes, pt, lerp, clamp, mix, smooth };
