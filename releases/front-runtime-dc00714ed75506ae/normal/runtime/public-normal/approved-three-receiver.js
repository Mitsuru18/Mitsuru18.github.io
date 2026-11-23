import{inferredThreeDisplay}from'./approved-three-combat.js';
// Candidate-approved C policy: only source-null knee/ankle receiver endpoints.
// Observed source points remain exact. Display inference is labeled gameplay proxy.
export function threeReceiverSurface(p){const display=inferredThreeDisplay(p.id,p),joints={...p.joints},provenance={...p.provenance};for(const side of['support','strike'])for(const part of['knee','ankle']){const key=side+'_'+part;if(p.provenance[key]!=='reviewed-display'){joints[key]=[...display[key]];provenance[key]='inferred gameplay surface';}}return{joints,provenance,policy:'C-source-null-inferred-gameplay-v3',sourceIndex:p.index};}
