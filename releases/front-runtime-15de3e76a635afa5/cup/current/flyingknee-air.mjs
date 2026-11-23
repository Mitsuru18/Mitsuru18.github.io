import*as A from'./flyingknee-pose.mjs';
export const START=.4+17/30,END=.4+32/30,RAMP=2/30;
const smooth=q=>q*q*(3-2*q);
function weight(t){return t<=START||t>=END?0:Math.min(smooth(Math.min(1,(t-START)/RAMP)),smooth(Math.min(1,(END-t)/RAMP)));}
const N=24600,DT=A.TOTAL_SECONDS/N,raw=[],loss=[0];for(let i=0;i<=N;i++){raw[i]=A.poseAt(i*DT).j.center[0]/.41;if(i)loss[i]=loss[i-1]+(raw[i]-raw[i-1])*weight((i-.5)*DT);}
export function airPose(t,{retained=.1}={}){const p=A.poseAt(t),at=Math.max(0,Math.min(N,t/DT)),i=Math.floor(at),q=at-i,L=loss[i]+((loss[Math.min(N,i+1)]??loss[i])-loss[i])*q,root=p.j.center[0]/.41-(1-retained)*L;return{...p,root,airLoss:(1-retained)*L,j:Object.fromEntries(Object.entries(p.j).map(([k,v])=>[k,[v[0]-(1-retained)*L*.41,v[1]]]))};}
