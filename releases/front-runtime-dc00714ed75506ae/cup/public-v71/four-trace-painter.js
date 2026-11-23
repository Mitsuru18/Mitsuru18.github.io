import{paintBoundsContext}from'./four-trace-paint-bounds.js';
import{hairShape}from'./appearance.js';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,q)=>a+(b-a)*q,smooth=x=>{x=clamp(x);return x*x*(3-2*x)},pt=(x,y)=>({x,y}),lerp=(a,b,t)=>pt(mix(a.x,b.x,t),mix(a.y,b.y,t));
function redMix(color,alpha){const rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16)),red=[255,38,56];return '#'+rgb.map((v,i)=>Math.round(mix(v,red[i],alpha)).toString(16).padStart(2,'0')).join('');}
/** Color compositing is performed inside the existing anatomical primitives,
 * before foreground limbs are painted. It is exactly a translucent red mix
 * of their opaque palette colors, preserving contours, detail and occlusion.
 * The leg mask is local to the receiving lead/support knee, not both legs. */
function damagePalette(c,P,flashes,target,knee=null){
 const flash=flashes?.find(f=>f.target===target);if(!flash)return P;
 return Object.fromEntries(Object.entries(P).map(([key,color])=>{
  if(typeof color!=='string'||!/^#[a-fA-F0-9]{6}$/.test(color))return[key,color];
  const tinted=redMix(color,flash.alpha);
  if(!knee)return [key,tinted];
  const gradient=c.createRadialGradient(knee.x,knee.y,3,knee.x,knee.y,15);
  gradient.addColorStop(0,tinted);gradient.addColorStop(1,color);return [key,gradient];
 }));
}
function path(c,points,fill,stroke='#253039',width=.65){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,a,b,color,w){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function oval(c,x,y,rx,ry,color,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=color;c.fill();}
function segment(c,a,b,r1,r2,color,light,shade){let dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.001){oval(c,a.x,a.y,Math.max(r1,r2),Math.max(r1,r2),color);return;}let nx=-dy/len,ny=dx/len;c.beginPath();c.moveTo(a.x+nx*r1,a.y+ny*r1);c.bezierCurveTo(a.x+dx*.38+nx*r1,a.y+dy*.38+ny*r1,b.x+nx*r2,b.y+ny*r2,b.x+nx*r2,b.y+ny*r2);c.quadraticCurveTo(b.x+dx/len*r2,b.y+dy/len*r2,b.x-nx*r2,b.y-ny*r2);c.bezierCurveTo(a.x+dx*.35-nx*r1,a.y+dy*.35-ny*r1,a.x-nx*r1,a.y-ny*r1,a.x-nx*r1,a.y-ny*r1);c.quadraticCurveTo(a.x-dx/len*r1,a.y-dy/len*r1,a.x+nx*r1,a.y+ny*r1);c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#2b3035';c.lineWidth=.55;c.stroke();line(c,lerp(a,b,.2),lerp(a,b,.73),light,r2*.46);if(shade)line(c,pt(a.x-nx*r1*.6,a.y-ny*r1*.6),pt(b.x-nx*r2*.7,b.y-ny*r2*.7),shade,.6);}
function foot(c,p,angle,P,far,pivot=0,pointed=0,projection=1){c.save();c.translate(p.x,p.y);c.rotate(angle);const foreshorten=mix(1,-1,pivot);c.scale((foreshorten<0?-1:1)*Math.max(.24,Math.abs(foreshorten))*projection,1);if(pointed>.01){
 // A plantar-flexed bare foot, not the standing foot rotated into a spear.
 // Rounded heel, instep and toe pads remain attached to the actual IK ankle.
 c.beginPath();c.moveTo(-2,-2);c.bezierCurveTo(1,-2.1,3,-.9,5.2,-1.2);c.quadraticCurveTo(8.6,-1.4,9.15,-.1);c.quadraticCurveTo(9.7,.9,9.1,2);c.quadraticCurveTo(8.75,2.7,7.7,2.7);c.quadraticCurveTo(5.8,3.1,3.8,2.1);c.quadraticCurveTo(1.2,1.4,-.7,3.1);c.quadraticCurveTo(-3.5,3.8,-3.2,.9);c.quadraticCurveTo(-3.1,-.8,-2,-2);c.closePath();c.fillStyle=far?P.shade:P.skin;c.fill();c.strokeStyle='#253039';c.lineWidth=.55;c.stroke();line(c,pt(1,-.8),pt(6.5,-.1),P.light,.7);line(c,pt(7.4,.3),pt(7.7,1.5),P.shade,.45);
 }else{
 // Shared bare-foot silhouette: a broad toe pad and rounded front, not a triangular point.
 c.beginPath();c.moveTo(-3,-2);c.lineTo(1.8,-2);c.quadraticCurveTo(3.2,-1.2,4.4,-.55);c.quadraticCurveTo(6.5,-.05,8.2,-.05);c.quadraticCurveTo(9.65,.05,9.8,1.25);c.quadraticCurveTo(9.85,2.55,8.8,3);c.lineTo(-3.2,3);c.quadraticCurveTo(-4,2.8,-4,1.5);c.quadraticCurveTo(-4,-.9,-3,-2);c.closePath();c.fillStyle=far?P.shade:P.skin;c.fill();c.strokeStyle='#253039';c.lineWidth=.55;c.stroke();line(c,pt(3,1),pt(7.4,1.1),P.light,.7);line(c,pt(7.7,.8),pt(8,2.1),P.shade,.4);
 }c.restore();}

function hand(c,p,elbow,P,far){let a=Math.atan2(p.y-elbow.y,p.x-elbow.x);c.save();c.translate(p.x,p.y);c.rotate(a);path(c,[pt(-2,-2.7),pt(1.5,-3),pt(4,-1.8),pt(4,1.7),pt(1,3),pt(-2,2.2)],far?P.shade:P.skin);line(c,pt(1,-2),pt(1,1),P.shade,.5);c.restore();}
function torso(c,o,P,outfit=P){const h=o.hip,s=o.chest,dx=s.x-h.x,dy=s.y-h.y,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;const turn=o.bodyTurn||0,spin=o.spinWeight||0,yaw=o.spinYaw||0,back=spin>.5&&Math.cos(yaw)<-.2,width=(1-Math.abs(turn)*.25)*mix(1,.55+.45*Math.abs(Math.cos(yaw)),spin);const at=(p,w)=>pt(p.x+nx*w*width,p.y+ny*w*width);path(c,[at(s,-7),pt(s.x-3,s.y-3),at(s,9),at(lerp(s,h,.32),9),at(h,6),pt(h.x,h.y+5),at(h,-6),at(lerp(s,h,.3),-8)],P.outfit&&P.outfit!=='shorts'?P.bright:P.skin);const side=mix(mix(-1,1,clamp(turn)),-Math.cos(yaw),spin);path(c,[at(s,7*side),at(lerp(s,h,.5),6*side),at(h,6*side),at(h,side),at(lerp(s,h,.55),2*side),at(s,2*side)],P.outfit&&P.outfit!=='shorts'?P.cloth:P.shade,null);if(P.outfit&&P.outfit!=='shorts'){line(c,pt(s.x-4,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);line(c,pt(s.x+5,s.y),pt(s.x+1,s.y+7),P.cloth,1.5);}else if(back){line(c,pt(s.x,s.y+4),pt(h.x,h.y-8),P.shade,.7);line(c,pt(s.x-5,s.y+5),pt(s.x-2,s.y+12),P.shade,.65);line(c,pt(s.x+5,s.y+5),pt(s.x+2,s.y+12),P.shade,.65);}else{line(c,pt(s.x+2,s.y+7),pt(s.x+6,s.y+8),P.shade,.7);line(c,pt(s.x+2,s.y+8),pt(h.x+2,h.y-9),'#b37a58',.6);line(c,lerp(pt(h.x+2,h.y-8),at(lerp(s,h,.78),.5),o.shoulderFit||0),lerp(pt(h.x+5,h.y-7),at(lerp(s,h,.81),2.5),o.shoulderFit||0),P.shade,.5);}/* Rounded pelvis cloth replaces the detached rectangular overlay; pose and leg attachments stay intact. */path(c,[[-7,-3],[7,-3],[7.7,-1.5],[8,.4],[7.4,2.9],[5.5,5.1],[2,6],[-1,6],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),outfit.bright,null);path(c,[[-7,-3],[-5.6,-2.3],[-5.2,1.1],[-3.4,5.9],[-4.8,5.5],[-7.3,3.7],[-8,1.1],[-7.8,-1.2]].map(([x,y])=>pt(h.x+x,h.y+y)),outfit.cloth,null);line(c,pt(h.x-7,h.y-2),pt(h.x+7,h.y-2),outfit.accent||outfit.wrap,2);if(!back)line(c,pt(h.x+2-5*turn,h.y-1),pt(h.x+3-5*turn,h.y+5),outfit.wrap,1);}
function head(c,h,s,P,turn,spinYaw=0,spinWeight=0){segment(c,pt(s.x,s.y+1),pt(h.x-1,h.y+5),3.1,2.8,P.skin,P.light);c.save();c.translate(h.x,h.y);if(spinWeight>.5&&Math.cos(spinYaw)<-.25){path(c,[pt(-5,-5),pt(0,-8),pt(5,-5),pt(6,2),pt(3,7),pt(-3,7),pt(-6,2)],P.skin);path(c,[pt(-6,2),pt(-6,-3),pt(-3,-7),pt(2,-8),pt(6,-4),pt(6,3),pt(3,5),pt(0,3),pt(-3,5)],P.hair);line(c,pt(-3,6),pt(3,6),P.shade,.7);c.restore();return;}const reviewLeft=spinWeight>.5?Math.sin(spinYaw)>.3:turn>1.4;if(reviewLeft)c.scale(-1,1);c.rotate(Number.isFinite(P.reviewHeadRoll)?P.reviewHeadRoll*(reviewLeft?-1:1):Math.atan2(s.x-h.x,Math.abs(s.y-h.y))*.25);path(c,[pt(-5,-6),pt(1,-7),pt(5,-4),pt(5,0),pt(7,2),pt(5,3),pt(5,6),pt(1,8),pt(-3,6),pt(-5,2)],P.skin);path(c,(hairShape(P.hairStyle)||[[-5,2],[-6,-2],[-5,-6],[-1,-8],[3,-7],[5,-4],[1,-4],[-1,-2],[-3,-2],[-3,2]]).map(p=>pt(...p)),P.hair);oval(c,-2,1,1.5,2,P.light);line(c,pt(2,-1),pt(4,-.6),'#343036',.8);line(c,pt(3,4),pt(5,4),P.shade,.6);line(c,pt(0,6),pt(3,6),P.shade,.7);c.restore();}
function spinHead(c,o,P){
 if(o.headView!=='front'){
  const yaw=o.headView.includes('back')?Math.PI:o.headView.includes('left')?Math.PI/2:0;
  return head(c,o.head,o.chest,P,0,yaw,o.weight);
 }
 const h=o.head,s=o.chest;segment(c,pt(s.x,s.y+1),pt(h.x,h.y+5),3.1,2.8,P.skin,P.light);c.save();c.translate(h.x,h.y);if(o.koSurface)c.rotate(o.referenceHeadRoll||0);
 path(c,[pt(-5,-5),pt(0,-7),pt(5,-5),pt(6,1),pt(4,6),pt(0,8),pt(-4,6),pt(-6,1)],P.skin);
 path(c,[pt(-6,2),pt(-6,-3),pt(-3,-7),pt(1,-8),pt(5,-5),pt(6,1),pt(3,-3),pt(0,-2),pt(-3,-3),pt(-3,2)],P.hair);
 line(c,pt(-3,-.5),pt(-1,-.4),'#343036',.8);line(c,pt(1,-.4),pt(3,-.5),'#343036',.8);line(c,pt(0,0),pt(1,3),P.shade,.6);line(c,pt(-1,5),pt(2,5),P.shade,.6);c.restore();
}
/** Continuous display projection, including edge-on support-foot pivots.
 * The raw heel/toe/ankle tracks are unchanged. A signed instep vector replaces
 * binary sole reflection; a foreshortened foot retains a rounded volume. */
export function spinFootProjection(ankle,heel,toe){
 const dx=toe.x-heel.x,dy=toe.y-heel.y,len=Math.hypot(dx,dy),mid=lerp(heel,toe,.5),axis=len>1e-7?pt(dx/len,dy/len):pt(1,0);
 let normal=pt(-axis.y,axis.x);if(normal.x*(mid.x-ankle.x)+normal.y*(mid.y-ankle.y)<0)normal=pt(-normal.x,-normal.y);
 const height=Math.abs(normal.x*(mid.x-ankle.x)+normal.y*(mid.y-ankle.y));
 // Canonical bare-foot length10.9 from the existing approved body; use the
 // same scale on both art axes, so uncertain source points cannot make a needle.
 const scale=Math.min(len,10.9)/14,ux=axis.x*scale,uy=axis.y*scale,vx=normal.x*scale,vy=normal.y*scale;
 let x=ankle.x+normal.x*(height-3*scale),y=ankle.y+normal.y*(height-3*scale);
 let h=pt(x-4*ux+3*vx,y-4*uy+3*vy),t=pt(x+10*ux+3*vx,y+10*uy+3*vy);
 const oldHalf=Math.min(len,16)/2,oldSoleBottom=Math.max(mid.y-oldHalf*axis.y,mid.y+oldHalf*axis.y),solePlacementY=oldSoleBottom-Math.max(h.y,t.y);
 y+=solePlacementY;h.y+=solePlacementY;t.y+=solePlacementY;
 return {ux,uy,vx,vy,x,y,heel:h,toe:t,roundness:1-smooth(Math.min(len/7,height/2.3)),
  drawingFit:{inputHeelToeLength:len,inputNormalHeight:height,canonicalMaximumHeelToeLength:10.9,uniformScale:scale,solePlacementY,axisFromInput:true,posePointsUnchanged:true}};
}
function spinFoot(c,p,side,P,far,orientation=null,floorY=0){
 const ankle=p[side+'Ankle'],heel=p[side+'Heel'],toe=p[side+'Toe'];if(!ankle)return;
 if(heel&&toe){
  const override=side==='right'&&orientation?.farSupportArt||side==='left'&&orientation?.art,f=override?{...override}:spinFootProjection(ankle,heel,toe);
  // Review-only: the extended kicking foot shows its instep downward.
  // Keep its longitudinal axis, length, volume and ankle attachment unchanged.
  // The source ankle/sole offsets cannot determine the visible face of a foot.
  if(!override&&side==='left'&&orientation?.reverseAxis){f.ux=-f.ux;f.uy=-f.uy;f.heel=pt(f.x-4*f.ux+3*f.vx,f.y-4*f.uy+3*f.vy);f.toe=pt(f.x+10*f.ux+3*f.vx,f.y+10*f.uy+3*f.vy);}
  if(!override&&side==='left'&&orientation?.instepDown){const nx=-f.uy,ny=f.ux;if(f.vx*nx+f.vy*ny<0){f.vx=-f.vx;f.vy=-f.vy;f.heel=pt(f.x-4*f.ux+3*f.vx,f.y-4*f.uy+3*f.vy);f.toe=pt(f.x+10*f.ux+3*f.vx,f.y+10*f.uy+3*f.vy);}}

  const calibrated=calibrateFootArt(ankle,f,P,far,floorY);
  paintResolvedFoot(c,ankle,calibrated.art,P,far);

 }else if(toe){segment(c,ankle,toe,2.3,1.8,far?P.shade:P.skin,P.light,P.shade);}
 else { // Only the ankle/heel envelope is visible; do not invent a toe direction.
  oval(c,ankle.x,ankle.y,2.7,2.1,far?P.shade:P.skin);oval(c,ankle.x-.5,ankle.y-.5,1.3,.8,P.light);
 }
}

// The foot skin is registered to the floor without changing a joint or the
// affine foot shape. Its ankle-to-instep connector remains pinned to the ankle.
function paintResolvedFoot(c,ankle,f,P,far){
  // The ankle-to-instep attachment is anatomical, not a fading projection
  // accent. At idle this lies entirely inside the original foot artwork.
  segment(c,ankle,pt(f.x,f.y),1.8,1.8,far?P.shade:P.skin,P.light,P.shade);
  if(f.roundness>.001){c.save();c.globalAlpha*=f.roundness;segment(c,pt(f.x,f.y),lerp(f.heel,f.toe,.45),2,1.8,far?P.shade:P.skin,P.light,P.shade);segment(c,f.heel,f.toe,2,1.7,far?P.shade:P.skin,P.light,P.shade);c.restore();}
  if(Math.abs(f.ux*f.vy-f.uy*f.vx)>1e-7){c.save();c.transform(f.ux,f.uy,f.vx,f.vy,f.x,f.y);foot(c,pt(0,0),0,P,far);c.restore();}
}
function resolvedFootBounds(ankle,art,P,far){const b=paintBoundsContext();paintResolvedFoot(b.context,ankle,art,P,far);return b.result();}
function shiftedFootArt(f,lift){return{...f,y:f.y-lift,heel:pt(f.heel.x,f.heel.y-lift),toe:pt(f.toe.x,f.toe.y-lift)};}
// Canvas coverage can extend a fraction of a pixel past the analytic stroke.
// A 1/3 draw-unit sole clearance (one pixel at product 3x) keeps alpha>0
// pixels above the floor. It is applied only to feet within this ground band.
const FOOT_GROUND_CLEARANCE=1/3;
function calibrateFootArt(ankle,art,P,far,floorY=0){
 const targetY=floorY-FOOT_GROUND_CLEARANCE;
 const before=resolvedFootBounds(ankle,art,P,far);let lift=Math.max(0,before.maxY-targetY);
 if(!lift)return{art,lift:0,before,after:before,remaining:Math.max(0,before.maxY-targetY)};
 let next=shiftedFootArt(art,lift),after=resolvedFootBounds(ankle,next,P,far);
 // The connector rotates around its fixed ankle as the instep moves. Bounded
 // refinement accounts for that painted cap, never scales a foot or a bone.
 for(let n=0;n<3&&after.maxY>targetY+1e-9;n++){
  const more=after.maxY-targetY;lift+=more;next=shiftedFootArt(art,lift);after=resolvedFootBounds(ankle,next,P,far);
 }
 return{art:next,lift,before,after,remaining:Math.max(0,after.maxY-floorY)};
}
// Read-only telemetry uses the same resolved artwork as the source painter.
export function fourTraceFootRegistration(rig,side,palette){
 const p=rig.points,ankle=p[side+'Ankle'],key=side==='left'?'art':'farSupportArt',orientation=rig.reviewFootOrientation;
 const override=orientation?.[key],art=override?{...override}:spinFootProjection(ankle,p[side+'Heel'],p[side+'Toe']);
 if(!override&&side==='left'&&orientation?.reverseAxis){art.ux=-art.ux;art.uy=-art.uy;art.heel=pt(art.x-4*art.ux+3*art.vx,art.y-4*art.uy+3*art.vy);art.toe=pt(art.x+10*art.ux+3*art.vx,art.y+10*art.uy+3*art.vy);}
 if(!override&&side==='left'&&orientation?.instepDown&&art.vx*(-art.uy)+art.vy*art.ux<0){art.vx=-art.vx;art.vy=-art.vy;art.heel=pt(art.x-4*art.ux+3*art.vx,art.y-4*art.uy+3*art.vy);art.toe=pt(art.x+10*art.ux+3*art.vx,art.y+10*art.uy+3*art.vy);}
 const far=rig.partOrder.indexOf(side+'Thigh')<rig.partOrder.indexOf((side==='left'?'right':'left')+'Thigh');
 return calibrateFootArt(ankle,art,palette,far,-(rig.koFloorRegistration?.entryProxyLift||0));
}

// Review only. The far/support chain is drawn as one sagittal-plane limb.
// This is an inferred 2D retarget, not a recovered 3D reconstruction.
function supportLegAligned(c,o,P){
 const H=o.points.rightHip,K=o.points.rightKnee,A=o.points.rightAnkle;
 const n=(a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);return {x:-dy/l,y:dx/l}};
 const nh=n(H,K),na=n(K,A),nk0={x:nh.x+na.x,y:nh.y+na.y},nl=Math.hypot(nk0.x,nk0.y),nk={x:nk0.x/nl,y:nk0.y/nl};
 const at=(p,v,r)=>({x:p.x+v.x*r,y:p.y+v.y*r});
 const hp=at(H,nh,5.5),kp=at(K,nk,3.5),ap=at(A,na,2.1),hm=at(H,nh,-5.5),km=at(K,nk,-3.5),am=at(A,na,-2.1);
 c.beginPath();c.moveTo(hp.x,hp.y);c.bezierCurveTo(hp.x,hp.y+4,kp.x,kp.y-4,kp.x,kp.y);c.bezierCurveTo(kp.x,kp.y+4,ap.x,ap.y-4,ap.x,ap.y);c.quadraticCurveTo(A.x,A.y+2,am.x,am.y);c.bezierCurveTo(am.x,am.y-4,km.x,km.y+4,km.x,km.y);c.bezierCurveTo(km.x,km.y-4,hm.x,hm.y+4,hm.x,hm.y);c.quadraticCurveTo(H.x,H.y-4,hp.x,hp.y);c.closePath();c.fillStyle=P.shade;c.fill();c.strokeStyle='#2b3035';c.lineWidth=.55;c.stroke();
 // Continuous center-plane shading follows the actual bent chain, without assuming screen+x is anatomical front.
 const frontH={...H},frontK={...K},frontA={...A};
 line(c,lerp(frontH,frontK,.52),frontK,P.skin,1.25);oval(c,frontK.x,frontK.y,1.55,2.15,P.skin,.04);
 line(c,lerp(frontK,frontA,.13),lerp(frontK,frontA,.77),P.skin,1.05);
 // Existing shorts and ankle wrap dimensions are retained.
 segment(c,H,lerp(H,K,.53),6,5.1,P.cloth,P.cloth);
 segment(c,lerp(K,A,.88),A,2.3,2.1,P.wrap,'#fff5de');
}

function paintHumanSpin(c,o,P,flash=null){
 const p=o.points,order=o.partOrder,legP=damagePalette(c,P,flash,'leg',p.leftKnee);
 const bodyP=damagePalette(c,P,flash,'body'),headP=damagePalette(c,P,flash,'head');
 const far=side=>order.indexOf(side+'Thigh')<order.indexOf((side==='left'?'right':'left')+'Thigh');
 const farArm=side=>{const order=o.koOriginalPartOrder||o.partOrder;return order.indexOf(side+'UpperArm')<order.indexOf((side==='left'?'right':'left')+'UpperArm');};
 for(const part of order){
  if(o.visibility[part]==='occluded'&&o.weight>.99&&!o.koInferredParts?.includes(part)&&!(part==='rightThigh'||part==='rightShin'||part==='rightFoot'))continue;
  if(part==='torso'){torso(c,o,bodyP,P);continue;}
  if(part==='head'){spinHead(c,o,headP);continue;}
  if(o.reviewFarLeg&&part==='rightThigh'){supportLegAligned(c,o,P);continue;}
  if(o.reviewFarLeg&&part==='rightShin')continue;
  const side=part.startsWith('left')?'left':'right',partP=side==='left'&&/Thigh|Shin|Foot/.test(part)?legP:P,isFar=part.includes('Arm')||part.includes('Hand')?farArm(side):far(side),skin=isFar?partP.shade:partP.skin,light=isFar?partP.skin:partP.light;
  if(part.endsWith('Thigh')){const a=p[side+'Hip'],b=p[side+'Knee'];if(a&&b){segment(c,a,b,5.5,3.6,P.outfit==='gi'?(isFar?P.cloth:P.bright):skin,P.outfit==='gi'?P.bright:light,partP.shade);segment(c,a,lerp(a,b,.53),6,5.1,isFar?P.cloth:P.bright,P.cloth);}}
  else if(part.endsWith('Shin')){const a=p[side+'Knee'],b=p[side+'Ankle'];if(a&&b){segment(c,a,b,3.5,2.1,P.outfit==='gi'?(isFar?P.cloth:P.bright):skin,P.outfit==='gi'?P.bright:light,partP.shade);segment(c,lerp(a,b,.88),b,2.3,2.1,partP.wrap,'#fff5de');}}
  else if(part.endsWith('Foot'))spinFoot(c,p,side,partP,isFar,o.reviewFootOrientation,-(o.koFloorRegistration?.entryProxyLift||0));
  else if(part.endsWith('UpperArm')){const a=p[side+'Shoulder'],b=p[side+'Elbow'];if(a&&b){segment(c,a,b,3.8,2.7,skin,light,P.shade);if(['tee','gi'].includes(P.outfit))segment(c,a,lerp(a,b,P.outfit==='gi'?1:.48),3.9,3,isFar?P.cloth:P.bright,P.cloth);}}
  else if(part.endsWith('Forearm')){const guide=o.guides[part],a=guide?.start||p[side+'Elbow'],b=guide?.end||p[side+'Wrist'];if(a&&b){segment(c,a,b,2.9,1.8,P.outfit==='gi'?(isFar?P.cloth:P.bright):skin,light,P.shade);segment(c,lerp(a,b,.72),b,2.2,2.2,P.wrap,'#fff4dd');}}
  else if(part.endsWith('Hand')){const wrist=p[side+'Wrist'],handPoint=p[side+'Hand'];if(wrist&&handPoint){if(Math.hypot(wrist.x-handPoint.x,wrist.y-handPoint.y)>.1)segment(c,wrist,handPoint,1.8,2.2,skin,light,P.shade);hand(c,handPoint,Math.hypot(wrist.x-handPoint.x,wrist.y-handPoint.y)>.1?wrist:p[side+'Elbow']||wrist,P,isFar);}}
 }
}

// The exact same primitives are metered and drawn; no sparse foot proxy,
// clipping, joint/affine-shape deformation, or second body is involved.
export function fourTracePaintBounds(rig,palette){const b=paintBoundsContext();paintHumanSpin(b.context,rig,{...palette,reviewHeadRoll:rig.referenceHeadRoll});return b.result();}
export function fourTraceFloorRegistration(rig,palette){
 const meta=rig.koFloorRegistration;
 if(!meta)return{lift:0,inheritedAllowance:0,applied:false};
 const current=fourTracePaintBounds(rig,palette),sourcePenetration=0,inheritedAllowance=0;
 // Shared live/KO foot calibration has already removed the old source deficit.

 // Cancel only the existing rigid sparse-proxy lift in DISPLAY space before
 // replacing it with the painted envelope. Its .26 boundary otherwise pops.
 const proxyLift=meta.entryProxyLift||0;
 return{lift:Math.max(0,current.maxY+proxyLift-inheritedAllowance)-proxyLift,inheritedAllowance,sourcePenetration,current,proxyLift,applied:true};
}
export function paintFourTrace(c,rig,palette,flash=[]){
 const registration=fourTraceFloorRegistration(rig,palette);
 c.save();if(registration.lift)c.translate(0,-registration.lift);
 paintHumanSpin(c,rig,{...palette,reviewHeadRoll:rig.referenceHeadRoll},flash);c.restore();
}
