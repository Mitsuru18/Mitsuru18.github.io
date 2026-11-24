/** One uniform playback clock for the approved 67 x 30 fps source preview.
 * Keep the previous 1.17 s combat action length. F019 is the visible contact
 * study frame, F024 starts retraction, and F064–066 complete the landing.
 */
export const SPIN_TIMING=Object.freeze({
 frameCount:67,sourceFps:30,total:1.17,frameDuration:1.17/67,
 contactFrame:19,retractionFrame:24,settleFrame:58,landingFrame:64,
 windup:19*1.17/67,active:5*1.17/67,recovery:43*1.17/67,
 playbackRate:(67/30)/1.17
});
export function spinElapsed(action){
 if(Number.isFinite(action?.elapsed))return Math.max(0,action.elapsed);
 const p=Math.max(0,Math.min(1,action?.phaseProgress||0));
 return action?.phase==='active'?SPIN_TIMING.windup+p*SPIN_TIMING.active:
  action?.phase==='recovery'?SPIN_TIMING.windup+SPIN_TIMING.active+p*SPIN_TIMING.recovery:p*SPIN_TIMING.windup;
}
export function spinFrameIndex(action){return Math.min(66,Math.floor(spinElapsed(action)/SPIN_TIMING.frameDuration+1e-8));}
