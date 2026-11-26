// v29's same six index0 opening slots retain attacking AI and introductory weakness.
// Maximum HP always comes from allocated stamina; no legacy24HP override.
export const FIRST_DOJO=Object.freeze({power:.05,defense:.6,playerAI:Object.freeze({decisionProbability:1,approachMargin:30,attackMargin:20}),opponentSpacing:Object.freeze({approach:53,attack:60})});
export const starterLoadout=ids=>Array.isArray(ids)&&ids.length>0&&ids.every(id=>id==='jab'||id==='frontkick');
