// Original game roster; sporting identity describes techniques, not nationality.
export const WORLD_ROSTER_REVISION=3;
export const EXTRA_COUNTRIES=[
{id:'cn',name:'中国',city:'上海',color:'#bc7565',martialArt:'散打',places:['上海・拳脚道場','北京・長拳道場','広州・南街道場'],moves:['pushkick','cross','sidekick'],theme:'long-kicks'},
{id:'nl',name:'オランダ',city:'アムステルダム',color:'#c49b66',martialArt:'ダッチキックボクシング',places:['アムステルダム・運河道場','ロッテルダム・港の道場','ユトレヒト・連打道場'],moves:['cross','dutchlow','lowkick'],theme:'punch-low'},
{id:'mm',name:'ミャンマー',city:'ヤンゴン',color:'#b69b70',martialArt:'ラウェイ',places:['ヤンゴン・接近道場','マンダレー・膝の道場','バゴー・肘の道場'],moves:['elbow','knee','cross'],theme:'close-elbows'},
{id:'ph',name:'フィリピン',city:'マニラ',color:'#70a4b1',martialArt:'ヤウヤン',places:['マニラ・斜打道場','セブ・蹴りの道場','ダバオ・流動道場'],moves:['bolopunch','sidekick','lowkick'],theme:'angular-arms'},
{id:'ng',name:'ナイジェリア',city:'カノ',color:'#7da281',martialArt:'ダンベ',places:['カノ・槍拳道場','カドゥナ・盾手道場','ソコト・強打道場'],moves:['spear','cross','crouchpunch'],theme:'spear-shield'}
];
export const EXTRA_NAMES={
 cn:['梁 振岳','陳 剛嵐','林 烈峰','王 玄鋒','張 鉄航','劉 迅海','周 虎臣','黄 峻雷','呉 断雲','徐 竜牙','孫 震武','馬 天鋼'],
 nl:['ラーズ・ヴァルテン','ブラム・フェルク','ティース・ダール','コーエン・フェルト','ヨリス・ブランク','ディルク・ハルテン','ニーク・クライム','フロリス・ファルク','ルーク・フェルダン','セム・デ・ロート','ミラン・クラヴェン','バス・ファンデルク'],
 mm:['テット・ヤン','ゾー・ミンラ','ナイン・トゥレ','リン・カウン','アウン・ゼラ','イェ・ティハン','ピョー・テッカ','モー・ラウン','ヘイン・ザヤ','コー・ナンダ','トゥン・ヤーマ','ミン・タウラ'],
 ph:['ダリオ・バルコン','ロエル・サンガ','マルコ・タリガ','エンゾ・マグタン','ノエル・バグラ','ラフィ・アリガ','パオロ・サルガ','ティノ・バルサン','リオ・ダグロン','イサク・タルモ','レオ・ガルビン','マテオ・ダルザ'],
 ng:['アダム・ザルコ','ムサ・ガラン','ヤクブ・ダンロ','ハミド・サルガ','サニ・カルバ','アミヌ・ガルダ','ウスマン・タルゴ','バラ・ザンディ','ナシル・ガダル','ハルナ・ダルバ','イブラ・ザクラン','カビル・ダンザ']
};
export const EXTRA_DEFENSE={cn:'sway',nl:'guard',mm:'guard',ph:'sway',ng:'guard'};
export function countryKit(c,index,old){if(!c.theme)return old;const[a,b,d]=c.moves,guard=EXTRA_DEFENSE[c.id];const kits={
 'long-kicks':[['jab','frontkick'],['frontkick','jab'],[a,'jab','guard'],['cross','frontkick'],['lowkick','frontkick'],['cross',guard],['frontkick',a,'guard'],['sidekick',a],['cross',b,a,'sway'],['jab',a,'sway'],['lowkick','sidekick','cross'],[d,a,b,'jab','guard','sway']],
 'punch-low':[['jab','frontkick'],['jab','lowkick'],['jab',a,'lowkick'],['jab','cross'],['lowkick','cross'],['cross',guard],['jab','lowkick','guard'],['cross','lowkick'],['jab','cross',b,'guard'],['jab','cross',b,'sway'],['cross',b,'lowkick'],['jab','cross',b,d,'guard','sway']],
 'close-elbows':[['jab','frontkick'],['jab','knee'],[a,'jab'],['jab','cross'],['knee','lowkick'],[a,guard],['knee',a,'guard'],['jab','knee'],[b,a,'jab'],['jab',a,'sway'],['knee',a,'cross'],[a,b,d,'jab','guard','sway']],
 'angular-arms':[['jab','frontkick'],['jab','lowkick'],[a,'jab','guard'],['cross',a],['lowkick','frontkick'],[a,guard],['cross',a,'guard'],['sidekick',a],['sidekick',a,'lowkick'],['jab',a,'sway'],['cross',a,'lowkick'],[a,b,d,'jab','guard','sway']],
 'spear-shield':[['jab','frontkick'],['jab','cross'],[a,'jab','guard'],[a,'cross'],['lowkick',a],['cross',guard],[a,'guard'],[a,'jab'],[a,b,'guard','sway'],[a,'jab','sway'],[a,'cross','crouchpunch'],[a,b,d,'jab','guard','sway']]
};return kits[c.theme][index];}

// Game curricula use the existing moves; these are tactical identities, not
// assertions that every real-world practitioner fights in one national style.
export const COUNTRY_TACTICS=Object.freeze({
 jp:{theme:'measured-strikes',label:'拳脚の読み合い',hint:'拳で間合いを測り、直線の拳と横蹴りを使い分ける。',kit:['cross','sidekick','lowkick','jab','midguard','guard'],streets:['jab','cross','lowkick','sidekick']},
 th:{theme:'close-defense',label:'近距離と守備',hint:'近づいて膝とロー。胴と脚の守備を見て打点を変える。',kit:['knee','lowkick','cross','jab','midguard','lowguard'],streets:['jab','knee','lowkick','cross'],dojoStyle:'balanced'},
 br:{theme:'level-change',label:'上下の揺さぶり',hint:'低い姿勢の拳と蹴りを混ぜ、狙う高さを変える。',kit:['crouchpunch','crouchlowkick','knee','jab','sway','lowguard'],streets:['jab','crouchpunch','crouchlowkick','knee']},
 kr:{theme:'long-kicks',label:'遠間の蹴り',hint:'横蹴りで離れた間合いを保ち、跳び蹴りと踵落としへ。',kit:['sidekick','jumpkick','frontkick','guard','sway'],streets:['frontkick','sidekick','jumpkick','jab'],dojoStyle:'outside'},
 fr:{theme:'fencing-kicks',label:'蹴りと足運び',hint:'直線の蹴りと拳を使い分け、一撃の後に間合いを整える。',kit:['sidekick','frontkick','cross','crouchpunch','sway','midguard'],streets:['frontkick','cross','sidekick','crouchpunch']},
 us:{theme:'boxing-levels',label:'拳の打ち分け',hint:'短い拳を中心に頭と胴を打ち分け、スウェイで返す。',kit:['jab','cross','crouchpunch','frontkick','guard','sway'],streets:['jab','cross','crouchpunch','frontkick']},
 cn:{theme:'push-exit',label:'押し蹴りと間合い',hint:'押し蹴りで距離を作り、道場では一撃の後に離れて入り直す。',kit:['pushkick','cross','sidekick','midguard','sway'],streets:['frontkick','pushkick','cross','sidekick'],dojoStyle:'outside'},
 nl:{theme:'punch-low',label:'拳からロー',hint:'パンチ、ストレート、踏み込みローを通常の行動順でつなぐ。',kit:['jab','cross','dutchlow','lowkick','guard','sway'],streets:['jab','cross','lowkick','dutchlow'],dojoStyle:'pressure'},
 mm:{theme:'close-elbows',label:'接近の肘膝',hint:'短い間合いへ入り、肘と膝を使い分ける。',kit:['elbow','knee','cross','jab','guard','midguard'],streets:['jab','elbow','knee','cross']},
 ph:{theme:'angular-arms',label:'弧のある拳',hint:'ボロパンチの軌道と横蹴り、ローで打点を散らす。',kit:['bolopunch','sidekick','lowkick','jab','sway','guard'],streets:['jab','bolopunch','lowkick','sidekick']},
 ng:{theme:'spear-shield',label:'槍拳と守り',hint:'槍拳を主軸に、頭を守りながら短い拳を重ねる。',kit:['spear','cross','crouchpunch','jab','guard','midguard'],streets:['jab','spear','cross','crouchpunch']}
});
export function countryTacticalKit(c,index,old,rewards=[]){
 const p=COUNTRY_TACTICS[c.id];if(!p||index<3)return old;
 const lesson=index%3===2||index===12;
 const pool=lesson?p.kit:[p.streets[(index-3+p.streets.length)%p.streets.length],p.streets[(index-2+p.streets.length)%p.streets.length],...(index===6||index===9?[p.streets[(index-1+p.streets.length)%p.streets.length]]:[]),...(index>=6?p.kit.filter(id=>['guard','midguard','lowguard','sway'].includes(id)).slice(0,2):[])];
 // The named lesson always comes first and survives the shared4/2/2 limiter.
 return[...new Set([...rewards,...pool])];
}
export function countryTacticalProfile(c,index,kind){const p=COUNTRY_TACTICS[c.id];return index<2?null:{curriculum:true,combatTheme:p.theme,tacticalLabel:p.label,tacticalHint:p.hint,...(kind==='dojo'&&p.dojoStyle?{strategy:p.dojoStyle}:{})};}
