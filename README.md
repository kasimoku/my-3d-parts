# my-3d-parts
Three.js 3Dパーツライブラリ

## parts（自然物）
- `lowpoly_BLTree01.jsx` — 広葉樹・ローポリ・ミニマル
- `lowpoly_CTree01.jsx` — 針葉樹・ローポリ・ミニマル
- `lowpoly_rock01.jsx` — 岩・ローポリ・ミニマル
- `lowpoly_rice-weed01.jsx` — イネ科草・ローポリ・ミニマル
- `lowpoly_rosetteweed01.jsx` — ロゼット草・ローポリ・ミニマル
- `sabchan.jsx` — サブちゃん・3D世界の現場監督アバター
- `forest1.jsx` — ローポリ球群の森・`createForest1()` エクスポート・シード固定乱数・半透明球あり
- `forest2.jsx` — 混成林・ローポリ・広葉樹6本＋針葉樹7本・フォグあり
- `cloud1.jsx` — ローポリ白球群の雲・`createCloud1()` エクスポート・シード固定乱数・半透明球24個
- `Frame.jsx` — ローポリ格子フレーム・S/M/L の3サイズ (`createFrameS` / `createFrameM` / `createFrameL`)・外周◻︎構造・縦柱＋横梁間隔1統一
- `Frame_6-4.jsx` — 6x4 ローポリフレーム・`createFrame64()` エクスポート・外周縦柱＋横梁y=1〜6
- `Materis1.jsx` — マテリス1・ざらざら・`createMateris1()` エクスポート・2スラブ＋目＋瞳の複合キャラクター形状・グレー/shininess:2
- `Materis2.jsx` — マテリス2・ツルツル・`createMateris2()` エクスポート・ダークグレー/shininess:120
- `Materis3.jsx` — マテリス3・ライム発光・`createMateris3()` エクスポート・emissive(0x88ff22)/emissiveIntensity:0.6
- `Materis4.jsx` — マテリス4・ワイヤー・`createMateris4()` エクスポート・青/wireframe:true
- `Materis5.jsx` — マテリス5・頂点カラー・`createMateris5()` エクスポート・赤↔青グラデーション/shininess:120

## landmark（建造物）
> React不要のThree.jsモジュール。`createXXX()` でGroupを返すので `scene.add()` で使用。

- `lowpoly_torii01.js` — 鳥居・ローポリ・ミニマル
- `lowpoly_lighthouse01.js` — 灯台・ローポリ・ミニマル
- `lowpoly_windmill01.js` — 風車・ローポリ・ミニマル・`update()` で羽根回転
- `TORCH.js` — 惑星coccolithのランドマーク #01・三角錐クリップ構造・発光あり
