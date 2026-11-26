// Original game roster; sporting identity describes techniques, not nationality.
export const WORLD_ROSTER_REVISION=3;
export const EXTRA_COUNTRIES=[
{id:'cn',name:'中国',city:'上海',color:'#bc7565',martialArt:'散打',places:['上海・拳脚道場','北京・長拳道場','広州・南街道場'],moves:['pushkick','cross','sidekick'],theme:'long-kicks'},
{id:'nl',name:'オランダ',city:'アムステルダム',color:'#c49b66',martialArt:'ダッチキックボクシング',places:['アムステルダム・運河道場','ロッテルダム・港の道場','ユトレヒト・連打道場'],moves:['cross','dutchlow','lowkick'],theme:'punch-low'},
{id:'mm',name:'ミャンマー',city:'ヤンゴン',color:'#b69b70',martialArt:'ラウェイ',places:['ヤンゴン・接近道場','マンダレー・膝の道場','バゴー・肘の道場'],moves:['elbow','knee','cross'],theme:'close-elbows'},
{id:'ph',name:'フィリピン',city:'マニラ',color:'#70a4b1',martialArt:'ヤウヤン',places:['マニラ・斜打道場','セブ・蹴りの道場','ダバオ・流動道場'],moves:['bolopunch','sidekick','lowkick'],theme:'angular-arms'},
{id:'ng',name:'ナイジェリア',city:'カノ',color:'#7da281',martialArt:'ダンベ',places:['カノ・槍拳道場','カドゥナ・盾手道場','ソコト・強打道場'],moves:['spear','cross','crouchpunch'],theme:'spear-shield'}
,
{id:'in',name:'インド',city:'デリー',color:'#b57e5a',martialArt:'カラリパヤット',places:['デリー・カラリ道場','ムンバイ・格闘道場','チェンナイ・伝統道場'],moves:['sidekick','lowkick','cross'],theme:'long-kicks'},
{id:'id',name:'インドネシア',city:'ジャカルタ',color:'#7d9b76',martialArt:'プンチャック・シラット',places:['ジャカルタ・シラット道場','バンドン・伝統道場','スラバヤ・格闘道場'],moves:['elbow','lowkick','crouchpunch'],theme:'close-elbows'},
{id:'my',name:'マレーシア',city:'クアラルンプール',color:'#6f9a8d',martialArt:'シラット',places:['クアラルンプール・シラット道場','ペナン・格闘道場','ジョホール・伝統道場'],moves:['lowkick','elbow','sidekick'],theme:'angular-arms'},
{id:'kz',name:'カザフスタン',city:'アルマトイ',color:'#8d9bb5',martialArt:'ボクシング',places:['アルマトイ・拳闘道場','アスタナ・格闘道場','シムケント・伝統道場'],moves:['cross','hook','lowkick'],theme:'punch-low'},
{id:'uz',name:'ウズベキスタン',city:'タシュケント',color:'#9b8db5',martialArt:'クラッシュ',places:['タシュケント・クラッシュ道場','サマルカンド・格闘道場','ブハラ・伝統道場'],moves:['cross','hook','crouchpunch'],theme:'punch-low'},
{id:'kh',name:'カンボジア',city:'プノンペン',color:'#b56a5a',martialArt:'クン・クメール',places:['プノンペン・クメール道場','シェムリアップ・格闘道場','バッタンバン・伝統道場'],moves:['knee','elbow','lowkick'],theme:'close-elbows'},
{id:'ir',name:'イラン',city:'テヘラン',color:'#7a8b99',martialArt:'レスリング',places:['テヘラン・レスリング道場','イスファハン・格闘道場','シーラーズ・伝統道場'],moves:['cross','lowkick','hook'],theme:'punch-low'},
{id:'tr',name:'トルコ',city:'イスタンブール',color:'#a5697d',martialArt:'キックボクシング',places:['イスタンブール・格闘道場','アンカラ・拳法道場','イズミル・伝統道場'],moves:['sidekick','cross','lowkick'],theme:'long-kicks'},
{id:'gb',name:'英国',city:'ロンドン',color:'#5f7a95',martialArt:'ボクシング',places:['ロンドン・拳闘道場','マンチェスター・格闘道場','リバプール・伝統道場'],moves:['cross','hook','uppercut'],theme:'punch-low'},
{id:'ie',name:'アイルランド',city:'ダブリン',color:'#5f9570',martialArt:'ボクシング',places:['ダブリン・拳闘道場','コーク・格闘道場','ゴールウェイ・伝統道場'],moves:['cross','hook','crouchpunch'],theme:'punch-low'},
{id:'de',name:'ドイツ',city:'ベルリン',color:'#7d7d8c',martialArt:'キックボクシング',places:['ベルリン・格闘道場','ハンブルク・拳法道場','ミュンヘン・伝統道場'],moves:['cross','lowkick','sidekick'],theme:'punch-low'},
{id:'es',name:'スペイン',city:'マドリード',color:'#b58a5f',martialArt:'キックボクシング',places:['マドリード・格闘道場','バルセロナ・拳法道場','バレンシア・伝統道場'],moves:['sidekick','lowkick','cross'],theme:'long-kicks'},
{id:'it',name:'イタリア',city:'ローマ',color:'#8c6f9b',martialArt:'キックボクシング',places:['ローマ・格闘道場','ミラノ・拳法道場','ナポリ・伝統道場'],moves:['cross','sidekick','hook'],theme:'long-kicks'},
{id:'gh',name:'ガーナ',city:'アクラ',color:'#a58a4f',martialArt:'ボクシング',places:['アクラ・拳闘道場','クマシ・格闘道場','タマレ・伝統道場'],moves:['cross','hook','bolopunch'],theme:'angular-arms'},
{id:'eg',name:'エジプト',city:'カイロ',color:'#b09a6a',martialArt:'ボクシング',places:['カイロ・拳闘道場','アレクサンドリア・格闘道場','ギーザ・伝統道場'],moves:['cross','crouchpunch','hook'],theme:'angular-arms'},
{id:'ci',name:'コートジボワール',city:'アビジャン',color:'#6a9b7d',martialArt:'ボクシング',places:['アビジャン・拳闘道場','ブアケ・格闘道場','ヤムスクロ・伝統道場'],moves:['hook','cross','bolopunch'],theme:'angular-arms'},
{id:'tn',name:'チュニジア',city:'チュニス',color:'#9b7d6a',martialArt:'ボクシング',places:['チュニス・拳闘道場','スース・格闘道場','スファックス・伝統道場'],moves:['cross','lowkick','hook'],theme:'punch-low'},
{id:'ca',name:'カナダ',city:'トロント',color:'#7d95b5',martialArt:'キックボクシング',places:['トロント・格闘道場','モントリオール・拳法道場','バンクーバー・伝統道場'],moves:['cross','lowkick','sidekick'],theme:'punch-low'},
{id:'mx',name:'メキシコ',city:'メキシコシティ',color:'#b56a7d',martialArt:'ボクシング',places:['メキシコシティ・拳闘道場','グアダラハラ・格闘道場','モンテレイ・伝統道場'],moves:['hook','crouchpunch','cross'],theme:'angular-arms'},
{id:'cu',name:'キューバ',city:'ハバナ',color:'#5f8a9b',martialArt:'ボクシング',places:['ハバナ・拳闘道場','サンティアゴ・格闘道場','カマグエイ・伝統道場'],moves:['cross','hook','uppercut'],theme:'angular-arms'},
{id:'ar',name:'アルゼンチン',city:'ブエノスアイレス',color:'#6a7db5',martialArt:'ボクシング',places:['ブエノスアイレス・拳闘道場','コルドバ・格闘道場','ロサリオ・伝統道場'],moves:['cross','hook','lowkick'],theme:'punch-low'},
{id:'cl',name:'チリ',city:'サンティアゴ',color:'#9b5f6a',martialArt:'キックボクシング',places:['サンティアゴ・格闘道場','バルパライソ・拳法道場','コンセプシオン・伝統道場'],moves:['lowkick','cross','sidekick'],theme:'long-kicks'},
{id:'au',name:'オーストラリア',city:'シドニー',color:'#7d8c5f',martialArt:'キックボクシング',places:['シドニー・格闘道場','メルボルン・拳法道場','ブリスベン・伝統道場'],moves:['cross','lowkick','hook'],theme:'punch-low'},
{id:'nz',name:'ニュージーランド',city:'オークランド',color:'#5f6a7d',martialArt:'マウ・ラカウ',places:['オークランド・ラカウ道場','ウェリントン・格闘道場','クライストチャーチ・伝統道場'],moves:['cross','sidekick','axekick'],theme:'long-kicks'}];
export const EXTRA_NAMES={
 cn:['梁 振岳','陳 剛嵐','林 烈峰','王 玄鋒','張 鉄航','劉 迅海','周 虎臣','黄 峻雷','呉 断雲','徐 竜牙','孫 震武','馬 天鋼'],
 nl:['ラーズ・ヴァルテン','ブラム・フェルク','ティース・ダール','コーエン・フェルト','ヨリス・ブランク','ディルク・ハルテン','ニーク・クライム','フロリス・ファルク','ルーク・フェルダン','セム・デ・ロート','ミラン・クラヴェン','バス・ファンデルク'],
 mm:['テット・ヤン','ゾー・ミンラ','ナイン・トゥレ','リン・カウン','アウン・ゼラ','イェ・ティハン','ピョー・テッカ','モー・ラウン','ヘイン・ザヤ','コー・ナンダ','トゥン・ヤーマ','ミン・タウラ'],
 ph:['ダリオ・バルコン','ロエル・サンガ','マルコ・タリガ','エンゾ・マグタン','ノエル・バグラ','ラフィ・アリガ','パオロ・サルガ','ティノ・バルサン','リオ・ダグロン','イサク・タルモ','レオ・ガルビン','マテオ・ダルザ'],
 ng:['アダム・ザルコ','ムサ・ガラン','ヤクブ・ダンロ','ハミド・サルガ','サニ・カルバ','アミヌ・ガルダ','ウスマン・タルゴ','バラ・ザンディ','ナシル・ガダル','ハルナ・ダルバ','イブラ・ザクラン','カビル・ダンザ']
,
 in:['アーラヴ・シャルマ','ヴィクラム・パテル','ローハン・シン','アルジュン・クマール','カビール・ヴェルマ','デーヴ・カーン','ニキル・レッディ','ラージェシュ・ナーヤル','サンジャイ・グプタ','イムラン・ヤーダヴ','アーディティヤ・ラーオ','カラン・メーヘター'],
 id:['ブディ・サントソ','アグス・ウィジャヤ','ジョコ・プラタマ','リズキー・サプトラ','デディ・ヒダヤット','バンバン・ヌグロホ','アンディ・フィルマンスヤー','ファジャル・スティアワン','エコ・ラマダン','スラメット・クルニアワン','ワーユ・ハキム','ヘンドラ・プラセティオ'],
 my:['アーマド・ラーマン','ムハンマド・イスマイル','アミル・タン','ファイズ・リム','ハフィズ・ウォン','シャフィク・ハッサン','ダニエル・チョン','ジェイソン・ウン','ラージ・シン','アズラン・ユソフ','ウェイロン・タン','クマール・ラジャン'],
 kz:['ヌルラン・ベコフ','イェルラン・サルセノフ','ダニヤル・アフメトフ','ティムル・オマロフ','ルスラン・ジャクスルク','バウルジャン・トゥレゲノフ','セリク・ムハメドフ','アイドス・エシモフ','マディ・カイラトフ','カナト・バイメノフ','オルジャス・セイトフ','アルマン・ヌルラノフ'],
 uz:['ジャスル・カリモフ','オタベク・ラヒモフ','シェルゾド・ユスポフ','ウルグベク・アブドゥラエフ','アジズ・トゥルスノフ','ベクゾド・ナザロフ','サルドール・エルガシェフ','ジャムシド・ミルザエフ','ルスタム・ハキモフ','ファルフ・サイドフ','ボブル・ラフマトフ','ドニヨル・イスモイロフ'],
 kh:['ソク・ヘン','ダラ・ケオ','ピセット・メアス','ヴァンナク・オウク','ラター・チェア','コサル・サオ','チャン・ノヴ','ボレイ・ペン','ヴィアスナ・トゥチ','サムナン・リー','マカラ・コン','ラタナ・スオン'],
 ir:['アリ・ホセイニ','レザ・カリミ','メフディ・モハンマディ','ホセイン・アフマディ','サイード・レザイ','ヴァヒド・モラディ','ババク・アジジ','アラシュ・ラヒミ','ミラド・ニクナム','オミド・シャリフィ','ファルハド・テヘラニ','カーヴェ・ガセミ'],
 tr:['メフメト・ユルマズ','エムレ・デミル','セルカン・カヤ','ブラク・シャヒン','デニズ・アルスラン','カーン・コチ','オヌル・アイドゥン','ヴォルカン・オズトゥルク','ハカン・カプラン','ムラト・アヴジュ','セリム・チェティン','トルガ・ブルト'],
 gb:['ジャック・スミス','リアム・ジョーンズ','コナー・テイラー','ハリー・ブラウン','ジョージ・デイヴィス','アルフィー・ウィルソン','カラム・エヴァンス','デクラン・トーマス','リース・ロバーツ','キーラン・ウォーカー','トミー・ライト','ビリー・トンプソン'],
 ie:['ショーン・マーフィー','キアン・ケリー','ダラ・バーン','オシーン・ライアン','タイグ・オコナー','ローナン・ウォルシュ','フィオン・オブライエン','カハル・ドイル','オーウェン・マッカーシー','ロルカン・サリバン','パドレイグ・ブレナン','キリアン・フィッツジェラルド'],
 de:['ルーカス・ミュラー','フィン・シュミット','ヨナス・シュナイダー','レオン・フィッシャー','マクシミリアン・ウェーバー','エリアス・マイヤー','ノア・ワーグナー','パウル・ベッカー','フェリックス・ホフマン','ティム・シュルツ','ヤン・コッホ','ニクラス・リヒター'],
 es:['アレハンドロ・ガルシア','ハビエル・ロドリゲス','ディエゴ・マルティネス','パブロ・ロペス','セルヒオ・サンチェス','ラウル・ペレス','アルバロ・ゴメス','ウーゴ・フェルナンデス','マルコス・モレノ','アドリアン・ヒメネス','ルベン・トーレス','イバン・バスケス'],
 it:['マルコ・ロッシ','ルカ・ルッソ','アレッサンドロ・フェラーリ','マッテオ・グレコ','ロレンツォ・マリーノ','アンドレア・モレッティ','ジュゼッペ・コンティ','フランチェスコ・リッツォ','アントニオ・ロンバルディ','ダヴィデ・バルビエリ','シモーネ・フォンターナ','リッカルド・サントーロ'],
 gh:['クワメ・メンサー','コフィ・アサンテ','ヤウ・オウス','クワベナ・ボアテング','アクワシ・アッピア','ナナ・オセイ','クワク・アド','フィフィ・フリンポン','エノク・アモア','ソロモン・ギャシ','アイザック・ダルコ','プリンス・アントウィ'],
 eg:['アハメド・ハッサン','モハメド・イブラヒム','マフムード・エル＝マスリ','オマル・ナセル','ユセフ・ファフミ','ハーレド・アジズ','タレク・ラマダン','カリム・サード','ホサム・ヘルミ','シェリフ・タウフィーク','アムル・ガーネム','モスタファ・ソリマン'],
 ci:['クアディオ・コネ','ヤオ・トラオレ','コフィ・クリバリ','クアク・ディアロ','コナン・トゥーレ','ブル・ワタラ','バカラ・ディアバテ','セイドゥ・サンガレ','イブラヒム・フォファナ','ムサ・ケイタ','ラシナ・バンバ','シェイク・シラ'],
 tn:['モハメド・ベン・アリ','ヤシン・トラベルシ','ハムザ・ハッダード','アミン・マンスーリ','ハリル・ガルビ','ワリド・アヤディ','サミ・ブジド','ファレス・ジェラッシ','ナビル・フェルジャニ','アニス・カセム','メフディ・サッシ','ラミ・トゥアティ'],
 ca:['リアム・スミス','ノア・ブラウン','ルーカス・トランブレ','イーサン・マーティン','ローガン・ロイ','メイソン・ガニョン','オリバー・ウィルソン','ジェームズ・ジョンソン','ベンジャミン・マクドナルド','ヘンリー・テイラー','レオ・キャンベル','オーウェン・アンダーソン'],
 mx:['サンティアゴ・エルナンデス','マテオ・ガルシア','レオナルド・マルティネス','ディエゴ・ロペス','エミリアーノ・ゴンサレス','セバスティアン・ペレス','アレハンドロ・ロドリゲス','ダニエル・サンチェス','ガブリエル・ラミレス','ラファエル・トーレス','ホルヘ・フローレス','ルイス・リベラ'],
 cu:['ヨエル・ペレス','ヨルダン・ロドリゲス','ルイス・ゴンサレス','カルロス・エルナンデス','ホルヘ・ガルシア','ラファエル・マルティネス','ミゲル・ロペス','オスバルド・フェルナンデス','レイニエル・アルバレス','ユニエル・カスティージョ','ダミアン・オルティス','アレクセイ・レイエス'],
 ar:['サンティアゴ・ゴンサレス','マテオ・ロドリゲス','ベンハミン・フェルナンデス','ルーカス・ロペス','ティアゴ・マルティネス','ホアキン・ガルシア','バウティスタ・ペレス','フェリペ・サンチェス','ダンテ・ロメロ','トマス・ソサ','ニコラス・アルバレス','フランコ・トーレス'],
 cl:['マテオ・ゴンサレス','サンティアゴ・ムニョス','ルーカス・ロハス','ベンハミン・ディアス','アグスティン・ペレス','トマス・ソト','ビセンテ・コントレラス','マルティン・シルバ','ホアキン・マルティネス','マキシモ・セプルベダ','ディエゴ・モラレス','アロンソ・ロドリゲス'],
 au:['ジャック・スミス','オリバー・ジョーンズ','ノア・ウィリアムズ','ウィリアム・ブラウン','レオ・ウィルソン','ヘンリー・テイラー','チャーリー・ジョンソン','トーマス・ホワイト','ジェームズ・マーティン','ルーカス・アンダーソン','イーサン・トンプソン','メイソン・ウォーカー'],
 nz:['ジャック・スミス','オリバー・ウィリアムズ','レオ・ブラウン','ノア・ウィルソン','ルーカス・トンプソン','ウィリアム・テイラー','ジョージ・ウォーカー','チャーリー・ハリス','ウィレム・パラタ','マナイア・ロパタ','ニカウ・ヘナレ','タネ・ンガタ']};
export const EXTRA_DEFENSE={cn:'sway',nl:'guard',mm:'guard',ph:'sway',ng:'guard',in:'sway', id:'sway', my:'guard', kz:'guard', uz:'sway', kh:'guard', ir:'guard', tr:'sway', gb:'guard', ie:'sway', de:'guard', es:'guard', it:'sway', gh:'guard', eg:'guard', ci:'sway', tn:'guard', ca:'guard', mx:'sway', cu:'sway', ar:'guard', cl:'guard', au:'sway', nz:'guard'};
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
,
 in:{theme:'long-kicks',label:'足技と身のこなし',hint:'長い足技と低い姿勢。間合いを保つ相手には踏み込みが要る。',kit:['sidekick','lowkick','cross','jab','sway','guard'],streets:['jab','sidekick','lowkick','cross']},
 id:{theme:'close-defense',label:'低い姿勢と肘',hint:'低く入り、肘とローで崩す。',kit:['elbow','lowkick','crouchpunch','jab','guard','sway'],streets:['jab','elbow','lowkick','crouchpunch']},
 my:{theme:'level-change',label:'弧の動きとロー',hint:'回り込みながらローと肘を散らす。',kit:['lowkick','elbow','sidekick','jab','guard','midguard'],streets:['jab','lowkick','elbow','sidekick']},
 kz:{theme:'boxing-levels',label:'拳の圧力',hint:'重い拳からローへつなぐ。',kit:['cross','hook','lowkick','jab','guard','sway'],streets:['jab','cross','hook','lowkick']},
 uz:{theme:'boxing-levels',label:'組み際の拳',hint:'近い間合いで胴と頭を打ち分ける。',kit:['cross','hook','crouchpunch','jab','guard','midguard'],streets:['jab','cross','crouchpunch','hook']},
 kh:{theme:'close-defense',label:'膝と肘の近距離',hint:'首相撲の距離で膝と肘を重ねる。',kit:['knee','elbow','lowkick','jab','guard','midguard'],streets:['jab','knee','elbow','lowkick']},
 ir:{theme:'boxing-levels',label:'重心の低い拳',hint:'低い構えから拳とローを出す。',kit:['cross','lowkick','hook','jab','guard','lowguard'],streets:['jab','cross','lowkick','hook']},
 tr:{theme:'long-kicks',label:'直線の蹴りと拳',hint:'蹴りで測り、拳で詰める。',kit:['sidekick','cross','lowkick','jab','sway','guard'],streets:['jab','sidekick','cross','lowkick']},
 gb:{theme:'boxing-levels',label:'正統派の拳',hint:'ジャブで組み立て、強い一発を狙う。',kit:['jab','cross','hook','uppercut','guard','sway'],streets:['jab','cross','hook','uppercut']},
 ie:{theme:'boxing-levels',label:'粘りの拳',hint:'前に出続け、胴を削る。',kit:['cross','hook','crouchpunch','jab','guard','midguard'],streets:['jab','cross','hook','crouchpunch']},
 de:{theme:'long-kicks',label:'正確な打ち分け',hint:'乱れのない連打で点を重ねる。',kit:['cross','lowkick','sidekick','jab','guard','sway'],streets:['jab','cross','lowkick','sidekick']},
 es:{theme:'long-kicks',label:'回転のある蹴り',hint:'横の動きから蹴りを入れる。',kit:['sidekick','lowkick','cross','jab','guard','sway'],streets:['jab','sidekick','lowkick','cross']},
 it:{theme:'fencing-kicks',label:'蹴りと拳の連携',hint:'蹴りで開き、拳で閉める。',kit:['cross','sidekick','hook','jab','sway','midguard'],streets:['jab','cross','sidekick','hook']},
 gh:{theme:'angular-arms',label:'大ぶりの拳',hint:'弧を描く拳で角度を変える。',kit:['cross','hook','bolopunch','jab','guard','sway'],streets:['jab','cross','hook','bolopunch']},
 eg:{theme:'boxing-levels',label:'胴への圧力',hint:'胴を叩いて頭を落とさせる。',kit:['cross','crouchpunch','hook','jab','guard','midguard'],streets:['jab','cross','crouchpunch','hook']},
 ci:{theme:'angular-arms',label:'跳ねる拳',hint:'リズムを変えながら拳を散らす。',kit:['hook','cross','bolopunch','jab','sway','guard'],streets:['jab','hook','cross','bolopunch']},
 tn:{theme:'boxing-levels',label:'堅実な拳とロー',hint:'守りを固め、隙にローを返す。',kit:['cross','lowkick','hook','jab','guard','lowguard'],streets:['jab','cross','lowkick','hook']},
 ca:{theme:'long-kicks',label:'距離の管理',hint:'遠間を保ち、カウンターを狙う。',kit:['cross','lowkick','sidekick','jab','guard','sway'],streets:['jab','cross','lowkick','sidekick'],dojoStyle:'outside'},
 mx:{theme:'boxing-levels',label:'接近戦の連打',hint:'懐に入って胴と頭を連打する。',kit:['hook','crouchpunch','cross','jab','midguard','sway'],streets:['jab','hook','crouchpunch','cross'],dojoStyle:'pressure'},
 cu:{theme:'fencing-kicks',label:'流れるような拳',hint:'ステップで角度を作り、拳を流す。',kit:['cross','hook','uppercut','jab','sway','guard'],streets:['jab','cross','hook','uppercut']},
 ar:{theme:'boxing-levels',label:'攻防一体の拳',hint:'受けて即返すリズムで押す。',kit:['cross','hook','lowkick','jab','guard','sway'],streets:['jab','cross','hook','lowkick']},
 cl:{theme:'long-kicks',label:'ローの蓄積',hint:'ローを積み重ねて脚を止める。',kit:['lowkick','cross','sidekick','jab','guard','lowguard'],streets:['jab','lowkick','cross','sidekick']},
 au:{theme:'boxing-levels',label:'タフな打ち合い',hint:'下がらず打ち合う芯の強さ。',kit:['cross','lowkick','hook','jab','sway','guard'],streets:['jab','cross','lowkick','hook']},
 nz:{theme:'long-kicks',label:'跳躍と直線',hint:'高い打点と直線の蹴りで締める。',kit:['cross','sidekick','axekick','jab','guard','sway'],streets:['jab','cross','sidekick','axekick']}});
export function countryTacticalKit(c,index,old,rewards=[]){
 const p=COUNTRY_TACTICS[c.id];if(!p||index<3)return old;
 const lesson=index%3===2||index===12;
 const pool=lesson?p.kit:[p.streets[(index-3+p.streets.length)%p.streets.length],p.streets[(index-2+p.streets.length)%p.streets.length],...(index===6||index===9?[p.streets[(index-1+p.streets.length)%p.streets.length]]:[]),...(index>=6?p.kit.filter(id=>['guard','midguard','lowguard','sway'].includes(id)).slice(0,2):[])];
 // The named lesson always comes first and survives the shared4/2/2 limiter.
 return[...new Set([...rewards,...pool])];
}
export function countryTacticalProfile(c,index,kind){const p=COUNTRY_TACTICS[c.id];return index<2?null:{curriculum:true,combatTheme:p.theme,tacticalLabel:p.label,tacticalHint:p.hint,...(kind==='dojo'&&p.dojoStyle?{strategy:p.dojoStyle}:{})};}
