// Integration helper only. Never owns action clock or body pose.
export function sampleHeadTrack(track,index){
 if(!Number.isFinite(index))throw new TypeError('Explicit finite source index required');
 const rows=track.frames,x=Math.max(0,Math.min(112,index)),lo=Math.floor(x),hi=Math.min(112,lo+1),q=x-lo,a=rows[lo],b=rows[hi];
 const mix=k=>a[k]+(b[k]-a[k])*q;
 return {yaw:mix('headVisualYaw'),roll:mix('headVisualRoll'),pitch:mix('headVisualPitch'),sourceIndex:x,interpolated:q!==0,sourceTime:a.source_time.ui_time_seconds+(b.source_time.ui_time_seconds-a.source_time.ui_time_seconds)*q};
}
// Use only inside the existing doubled-coordinate sweep painter, AFTER its
// scale(face*.5,.5). The owner's original head center is never replaced.
export function drawHeadAtProductCenter(ctx,headPainter,productPose,angles){
 headPainter(ctx,{joints:{head:productPose.joints.head}},angles.yaw,angles.roll,angles.pitch);
}
