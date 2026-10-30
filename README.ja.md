<div align="center">

[🇺🇸 EN](README.en.md) · [🇨🇳 简中](README.zh-CN.md) · [**🇯🇵 日本語**](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**どんな脚本も、顔出しなしのYouTubeチャンネルでバズる、多彩な画風の棒人間アニメ動画に。完全オープンソース。**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

トピック、記事、台本から始められます。ビジュアル、ナレーション、字幕、効果音を自動で組み合わせ、公開できる棒人間動画に仕上げます。

**⚡ 100% 無料・オープンソース。顔出しも月額50ドルのサブスクも不要。何日もかけず、数分で完成。**

**科学解説、ダーク心理学、テクノロジー寓話、話題の逸話、ストーリーテリング系チャンネル**向けの画風を継続的に追加しています。

</div>

<table width="100%">
<tr>
<td width="50%" align="center">
<strong>クラシック白黒</strong><br>
<a href="#a1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="クラシック白黒の棒人間アニメ：黒背景と白い線で伝える解説動画" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>モダンポップ</strong><br>
<a href="#a2"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="モダンポップの棒人間アニメ：赤いニット帽のキャラクターとテック系の光" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>原始時代・洞窟スタイル</strong><br>
<a href="#a3"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="原始時代の棒人間アニメ：洞窟を舞台にした意外なオチのある物語" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>ほっとする日常ストーリー</strong><br>
<a href="#a4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="日常を描く棒人間アニメ：彩りのある風景と共感できる小さな出来事" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>歴史カートゥーン</strong><br>
<a href="#style-5"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan-hero.gif" alt="歴史カートゥーンの棒人間アニメ：江戸時代の武士の物語" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>ミニマル手描き</strong><br>
<a href="#b1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="ミニマル手描きの棒人間動画：表情豊かなキャラクター、強調テキスト、部分アニメーション" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>Amber Noir</strong><br>
<a href="#a6"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@828b865b37cbff61464b9c00e04bce79f79b3b5c/assets/readme/previews/style-6-amber-noir-flow.gif" alt="Amber Noirの棒人間アニメーション：暖かな街灯と深い影の街、オレンジのパーカーのキャラクター" width="90%"></a>
</td>
<td width="50%" align="center">
<a href="#a7"><strong>近日公開…</strong></a>
</td>
</tr>
</table>

<div align="center">

**7つの画風 · 9つのビジュアル · 制作例あり · 無料・オープンソース**

⭐ **プロジェクトに Star を付けて、次の画風追加や新機能の解放をチェックしましょう。**

[使い始める](#quick-start) · [Director の画風](#a-styles) · [Autopilot の画風](#b-styles) · [よくある質問](#faq) · [ロードマップ](#road-to-10000-stars--creator-ecosystem)

</div>

<a id="creation-modes"></a>

## 🎬 動画の作り方は2通り

**すべてのショットを自分で決めたい？ A · Director Mode。シーンを自分でつながず完成動画が欲しい？ B · Autopilot Mode。** 1つのプロジェクトに、2つのワークフロー。

|  | <div align="center">A · Directorモード</div> | <div align="center">B · Autopilotモード</div> |
|:---:|:---|:---|
| **特徴** | **AIが演出を提案し、仕上がりは自分で調整**：絵コンテとプロンプトを受け取り、クリップの生成と編集を行います。 | **テーマや要望から完成動画へ**：イラスト、ナレーション、字幕、部分アニメーション、動画の合成まで自動で進めます。 |
| **長さ** | **短編向け**。目安は30秒〜3分。クリップを重ねて、より長い内容も作れます。 | **長編向け**。特に**10分以上**のナレーション動画に。短編や連続ストーリーにも対応します。 |
| **必要な環境** | Skill 対応の AI アシスタントで構成を練り、好みの動画生成ツール（Google Flow、Runway、Luma、Kling など）でクリップを生成して、CapCut や Premiere で編集します。 | **Codex、Claude Code**など、ファイルの読み書き・ツール呼び出し・コマンド実行ができるAIエージェントで、素材生成とローカルでの動画合成をつなぎます。 |
| **映像表現** | **クリップごとのアニメーション生成**。人物の動作、カメラワーク、キャラクター同士のやり取りを重視します。 | **イラスト絵コンテ＋部分アニメーション**。カットの切り替え、ズーム、パンをナレーションに合わせ、毎回フルアニメーションを生成せずに物語を伝えます。 |
| **受け取れるもの** | 演出プラン、絵コンテ、クリップごとの動画プロンプト、サウンドデザイン。 | **ナレーション・字幕・部分アニメーション付きの完成動画ファイル**。 |
| **始める** | <div align="center"><a href="#director-start">Directorモードを使う</a></div> | <div align="center"><a href="#autopilot-start">Autopilotモードを使う</a></div> |

どちらのワークフローも、大まかなトピック、Web リンク、完成した台本から始められます。アスペクト比（9:16、16:9、1:1）、ナレーション言語、音声は自由に選べます。上記の長さは目安であり、厳密な制限ではありません。

💡 **セットアップのポイント**：

- **Director Mode** は通常の対話型 AI のチャット画面で利用できます。
- **Autopilot Mode** はファイルとターミナルにアクセスできる AI コーディングエージェント（**Claude Code、OpenAI Codex、Cursor** など）内で動作し、レンダリングからファイル納品までを自動で処理します。

<a id="quick-start"></a>

## 🧭 使い始める

Claude Code、Codex、Cursor、Antigravity、またはファイルとターミナルにアクセスできるエージェント環境に対応しています。

次の内容を AI アシスタントに送ってください：

```text
このSkillをインストールして：
https://github.com/kaomei/stickman-video-director

インストールできたら、すぐにインストール先のSKILL.mdを読み、
2つのモードで受け取れるもの、必要なツール、制作の流れを
分かりやすく説明し、そのまま使える依頼文の例を教えてください。
私の作りたい動画に合わせて、足りないものと次にすることも具体的に案内してください。
```

<a id="director-start"></a>

### A · Directorモード：クリップごとの動画プロンプトを作る

インストール後、テーマを書き換えて次の文章をAIアシスタントに送ってください。

```text
Directorモード／Aモードで、次のテーマ・原稿・要望を
棒人間動画にしてください：
[テーマを書く、原稿を貼る、または作りたい内容を説明する]

条件：横長16:9、A3「原始時代・洞窟スタイル」で、まずは30秒。
先に演出プランを見せて、確認してからクリップごとの動画プロンプトを出してください。
```

**流れ：テーマと要望を伝える → 物語の台本を作る → 必要に応じてキャラクターの三面図を確認する → 詳細な動画プロンプトを作る → 自分でクリップを生成し、編集して仕上げる**

演出プランには、物語の構成、場面ごとのナレーション、動作、カメラワーク、サウンドデザインが含まれます。確認したプロンプトを [Google Flow](https://flow.google.com/) などの動画生成ツールに順番に入力し、CapCutなどで字幕を付け、編集して仕上げます。

初めての動画は、[X のビジュアル制作ガイド](https://x.com/CrazyKaomei/status/2102311241046008268)（ステップごとの動画デモ付きスレッド）を参考に作ってみてください。

<a id="autopilot-start"></a>

### B · Autopilotモード：ひと言の依頼から長編動画へ

CodexやClaude Codeなど、ファイル操作とコマンド実行ができる環境にインストールしたら、次のように依頼します。

```text
Autopilotモード／Bモードで、次のテーマ・記事・投稿・ニュース・具体的な要望から、
YouTubeで興味を引く動画を作ってください：
[内容やリンクを貼る、または紹介・宣伝したい内容を説明する]

条件：5〜10分、横長16:9、B1「ミニマル手描き」。ナレーション、字幕、効果音を付けてください。

まず画像生成・音声合成・動画合成の設定を確認し、台本と音声付きの20秒プレビュー動画を見せてください。
確認後は、映像をナレーションのテンポに合わせて全編を自動制作し、完成動画ファイルを納品してください。
クリップごとの生成や組み立てを、こちらで行わずに済むようにしてください。
```

**流れ：テーマ・内容・要望を伝える → 台本を確認する → 音声付きの20秒プレビュー動画を確認する → 全編を自動制作する → 完成動画を受け取る**

AIアシスタントが内容に合った絵コンテを作り、映像とナレーションを生成。字幕と効果音を加え、音声のテンポに合わせて一本の動画に仕上げます。主に確認するのは台本とサンプルで、クリップごとの生成や手作業での組み立ては不要です。

初回は必要な設定を確認し、不足しているものと準備方法を順番に案内します。映像や声が気になったら、その部分だけを調整し、確認済みの部分は残せます。

**どちらのモードでも選べる仕上げ：**完成動画に満足したら、[サムネイル＆公開キット](#thumbnail-publishing-kit)で画風に合ったサムネイルと投稿文を作ることも、そのまま終了することもできます。モードの切り替えや再インストールは不要です。

<a id="style-gallery"></a>

<a id="a-styles"></a>

## 🎨 A · Directorモードの画風一覧

A1、A2、A3…の番号で追加し、それぞれの画風に対応するアニメーション制作例を紹介します。

<a id="a1"></a>

### A1：クラシック白黒

少ない線で、伝えたいことをはっきりと。真っ白、または真っ黒な画面に、人物・小道具・アクセントカラーを配置します。テンポよく仕組みを伝える解説動画に向いています。

- **見た目：** 丸い頭、線の手足、そろった線幅。ときには簡単な表情も使います。鮮やかなアクセントカラーは最大3色で、感情・リスク・行動を区別。不安を檻に、集中力をゲージに置き換えるような視覚的なたとえも得意です。
- **向いている内容：** 科学、心理、自己管理、モチベーション、ビジネスの仕組み、概念の解説。
- **選び方：** 白背景に黒い棒人間はすっきりと分かりやすく、授業や身近な知識の解説に。黒背景に白い棒人間はコントラストが強く、緊張感、対立、感情を際立たせられます。

| A1.1 · 白背景・黒い棒人間 | A1.2 · 黒背景・白い棒人間 |
|:---:|:---:|
| <!-- demo:light:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/light-theme-demo.gif" alt="A1.1 · 白背景に黒い棒人間を描いたアニメ" width="360"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="A1.2 · 黒背景に白い棒人間を描いたアニメ" width="360"><!-- demo:dark:end --> |
| 白いキャンバス · 黒い人物 | 黒いキャンバス · 白い人物 |

---

<a id="a2"></a>

### A2：モダンポップ

赤いニット帽と黄色いTシャツが目印。すっきりしたテック空間で商品を紹介することも、寝室や街、広い自然の中で物語を展開することもできます。

- **見た目：** 赤い帽子と黄色い服のミニマルなキャラクターに、2種類の舞台。ミニマルテックは白い空間、薄いグリッド、浮かぶガラス風UI、シアンや青の光。カラーストーリーは色彩豊かな背景、映画的な光、奥行きで物語の雰囲気を作ります。
- **向いている内容：** ミニマルテックはAIツール、テック製品、使い方や機能紹介。カラーストーリーは成長、暮らし、冒険、励ましの物語。
- **選び方：** ツールや方法を「分かりやすく説明する」ならミニマルテック、登場人物の体験を「一緒にたどる」ならカラーストーリー。

| A2.1 · ミニマルテック | A2.2 · カラーストーリー |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="A2.1 · ミニマルなテック空間のアニメ" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2b-demo.gif" alt="A2.2 · 彩りと光で物語を描くアニメ" width="360"> |
| 白い空間 · 薄いグリッド · シアンの光 | カラフルな舞台 · 映画的な光 · 物語の空気感 |

---

<a id="a3"></a>

### A3：原始時代・洞窟スタイル

スマホもオフィスもない世界に、今の悩みを持ち込んだら？ 洞窟、獣皮、焚き火、大げさな表情で、仕事や人間関係の「あるある」を意外なオチにつなげます。

- **見た目：** ラフな手描き線、白く塗った頭、黒い手足、獣皮の服、土色の背景。掛け合い、表情の変化、笑いの間を大切にします。年齢や性別は物語に合わせて設定し、別の物語で同じ顔を使い回す必要はありません。
- **向いている内容：** 原始時代の「もしも」、職場風刺、人間観察、ブラックユーモア、寓話、子ども向け英語の物語。
- **選び方：** 短い出来事から「なるほど」「そう来たか」と思わせたいときに。現代の人間関係を原始の部族に移すと、見慣れた悩みが違って見えてきます。

| 制作例1：『人類最初の仕事は、どう生まれた？』 | 制作例2：『人類が初めて火を見つけた日』 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="『人類最初の仕事は、どう生まれた？』のプレビュー" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-community-fire.gif" alt="火の発見をテーマにしたユーザー作品" width="360"> |
| 原始時代の物語 · 仕事の皮肉 | 火の発見 · ユーザー作品 |

---

<a id="a4"></a>

### A4：ほっとする日常ストーリー

使うのがもったいなくてしまっているマグカップ。つい即返信してしまうメッセージ。ようやく自分のために空けた午後。身近な小さな出来事を、シンプルな人物と彩りのある風景で描きます。

- **見た目：** 白く塗った丸い頭、細長い胴体、黒い細い手足、さりげない表情。背景はフルカラーの2Dアニメです。引きの画で場所を見せ、寄りで迷いや安堵を捉え、移動ショットで次の展開へつなぎます。
- **向いている内容：** 日常の共感、心の成長、人間関係、温かい物語、習慣作り、子ども向け英語。
- **選び方：** 見た人が「自分にもある」と感じる場面を描きたいときに。色と光はテーマに合わせ、温もりだけでなく、不安や疲れ、再出発も表現できます。

| 制作例1：通勤中も気になるメッセージ | 制作例2：自分の時間を取り戻す |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-station.gif" alt="ほっとする日常ストーリー：駅でメッセージが気になってしまう主人公" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="ほっとする日常ストーリー：木漏れ日のカフェでひと息つく主人公" width="360"> |
| 駅 · 歩く姿を追うカメラ · 表情のアップ | オープンカフェ · 木漏れ日 · 日常のしぐさ |

---

<a id="style-5"></a>
<a id="a5"></a>

### A5：歴史カートゥーン

江戸の町を歩く武士、古代エジプトの神殿にいる黒猫、ローマの野営地で働く兵士。時代ごとの衣装や彩り豊かな風景、小さな意外性のある展開で、歴史の話を「登場人物が体験する物語」にします。

- **見た目：** 白く塗った丸い頭、黒い楕円の目、くっきりした輪郭と細い手足。衣装には柔らかなセル調の陰影を付け、背景は絵画的に描きます。時代や地域が変わっても人物の描き方はそろえ、服・建物・小道具・音楽を切り替えます。
- **向いている内容：** 世界史、歴史の小話、昔の暮らし、人物紹介、歴史を題材にしたコメディ。
- **選び方：** 知識を並べるより、一つの出来事を通して伝えたいときに。登場人物の反応や意外なオチが、解説の続きを見たくなるきっかけになります。

| 制作例1：江戸の武士の日常 | 制作例2：古代エジプトの猫とミイラ |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan.gif" alt="歴史カートゥーン：江戸の町で暮らす武士" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-egypt.gif" alt="歴史カートゥーン：古代エジプトの神殿にいる黒猫とミイラ" width="360"> |
| 江戸の町並み · 武士の装い · 日常の意外な一面 | 彩り豊かな神殿 · 黒猫 · 歴史の小話 |

画風・プロンプトの提供：[Lawal Ridwan / @leksautomate](https://github.com/leksautomate)。

---

<a id="a6"></a>

### A6: Amber Noir

暖かな金色の光、深い影、オレンジのパーカーを着た黒い丸頭のキャラクター。気になる「もしも」を、小さな映画のような物語に。カメラに向かって話すのではなく、表情豊かな動きで伝えます。

- **ビジュアル**：暖かな琥珀色のハイライトと深いプラム色の影。シンプルなシルエット、柔らかな陰影の街並み、控えめなカメラワークが特徴です。
- **向いている内容**：「もしも」のシナリオ、心理学、現代の寓話、意外な発見、どんでん返しのある短い物語。
- **こんなときに**：映画的なアニメーションに、独立したナレーションを添えたい場合。ブラウザー操作に対応したエージェントなら、承認済みのクリップをつなぎ、音声、効果音、太字の大文字字幕、すっきりした白いタイトルを加えられます。

| 作例 1：すべての値段が1万分の1になったら？ | 作例 2：走ってでも手に入れたいお買い得品 |
|:---:|:---:|
| <a href="assets/readme/style-6-amber-noir-mcp.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@828b865b37cbff61464b9c00e04bce79f79b3b5c/assets/readme/previews/style-6-amber-noir-mcp.gif" alt="Amber Noir：一夜で物価が下がる世界を描く20秒の物語" width="360"></a> | <a href="assets/readme/style-6-amber-noir-flow.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@828b865b37cbff61464b9c00e04bce79f79b3b5c/assets/readme/previews/style-6-amber-noir-flow.gif" alt="Amber Noir：オレンジのパーカーのキャラクターが店の前にいる8秒のアニメーション" width="360"></a> |
| Renoise MCP 作例 · 20秒 | Google Flow 作例 · 8秒 |

---

<a id="a7"></a>

### A7: 近日公開…

新しい特化型のディレクタースタイルをトレーニング中です。[プロジェクトに Star を付けて](#road-to-10000-stars--creator-ecosystem)、5,000 Stars での解放を応援してください！

---

<a id="b-styles"></a>

## 🤖 B · Autopilotモードの画風一覧

B1、B2、B3…の番号で追加。各画風に、イラスト絵コンテと部分アニメーションによる完成動画を掲載します。Aシリーズとは別に管理します。

<a id="b1"></a>

### B1：ミニマル手描き

映像の流れを、ナレーションに合わせて。表情豊かな棒人間、色の付いた手描きの小道具、目を引くキーワードで、知識、物語、商品の魅力を分かりやすく楽しく伝えます。

- **見た目：** 白に近い紙の背景とごく薄いグリッド。黒い手描き線に、少量のカラフルな小道具を組み合わせます。表情、部分的な動き、滑らかな場面転換、効果音で展開を作り、重要な文字は強調。字幕はナレーションに合わせます。
- **向いている内容：** YouTubeの解説動画、心理や成長の話、仕事の物語、学習コンテンツ、商品・サービスの紹介。
- **選び方：** テーマや原稿、物語の台本から、ナレーションと字幕付きの完成動画を作りたいときに。映像を音声のテンポに合わせて構成するため、継続的な解説や長めの物語に向いています。

GIFをクリックすると、音声付きサンプルを再生・ダウンロードできます。

<table width="100%">
  <tr>
    <th width="50%" align="center">制作例1：顔出しなしでYouTubeを始める</th>
    <th width="50%" align="center">制作例2：なぜ、誰にも見られない？</th>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="assets/readme/b1-minimal-handdrawn.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="B1ミニマル手描きの制作例1：顔出しなしのYouTube動画制作を紹介する音声付きサンプル" width="360"></a></td>
    <td width="50%" align="center"><a href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@61e202ccecf9d9926cf76e13f3284181297729b8/assets/readme/previews/b1-minimal-handdrawn-2026-10-23.gif" alt="B1ミニマル手描きの制作例2：Bodiのナレーション、字幕、手描きキャラクター、部分アニメーション付き" width="360"></a></td>
  </tr>
  <tr>
    <td align="center">手描きキャラクター · 強調テキスト · 部分アニメーション</td>
    <td align="center">Bodiのナレーション · 豊かな表情 · 部分アニメーション</td>
  </tr>
</table>

---

<a id="b2"></a>

### B2: 近日公開…

新しい Autopilot スタイルとプロシージャルアニメーションをトレーニング中です。[プロジェクトに Star を付けて](#road-to-10000-stars--creator-ecosystem)、5,000 Stars での解放を応援してください！

<!-- thumbnail-publishing-kit:start -->
<a id="thumbnail-publishing-kit"></a>

## 🖼️ 高クリック率サムネイル＆公開キット

**動画の魅力は、まずクリックされてこそ伝わります。** アニメーション完成後も同じワークフローで、画風に合ったサムネイル、高クリック率を狙うタイトル、視聴者の反応を引き出すフックをまとめて用意できます。

**Director Mode と Autopilot Mode** の両方で使える仕上げパックです。承認済みのキャラクターと画風に合わせたビジュアルフックに加え、公開用の YouTube メタデータを生成します。

<table width="100%">
  <tr>
    <td align="center"><a href="assets/readme/thumbnails/no-camera.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/no-camera.jpg" alt="NO CAMERA? — 表情豊かな手描きの棒人間と、取り消し線の入ったカメラ" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/first-job.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/first-job.jpg" alt="THE FIRST JOB — 巨大な石の障害物に向き合う先史時代のキャラクター" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/a5-samurai-taxes.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a5-samurai-taxes.jpg" alt="SAMURAI VS TAXES — セル画調の侍、江戸の街並み、木版画風のセリフ書体" width="280"></a></td>
  </tr>
  <tr>
    <td align="center">シンプルな問いと、一つの明確なシンボル。</td>
    <td align="center">巨大な障害物で物語を立ち上げる。</td>
    <td align="center">時代衣装、背景、見出し書体を統一。</td>
  </tr>
</table>

<table width="100%">
  <tr>
    <td align="center"><a href="assets/readme/thumbnails/a1-you-vs-you.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a1-you-vs-you.jpg" alt="YOU vs YOU — 巨大な自分に向き合う小さな黒い棒人間と控えめな赤いアクセント" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/a2-busy-vs-better.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a2-busy-vs-better.jpg" alt="BUSY ≠ BETTER — 作業カードに埋もれる赤い帽子のキャラクターと、一つの作業に集中する姿の対比" width="280"></a></td>
    <td align="center"><a href="assets/readme/thumbnails/a4-3am-again.jpg"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@ae1685ba812f9686463f319fe6f0d4eb7d581433/assets/readme/thumbnails/a4-3am-again.jpg" alt="3AM. AGAIN. — 深夜のスマホ、青い画面光、柔らかな手描き文字" width="280"></a></td>
  </tr>
  <tr>
    <td align="center">極端なサイズ差で一つの対立を描く。</td>
    <td align="center">忙しさと成果の違いをひと目で伝える。</td>
    <td align="center">共感できる場面、絵画的な光、手描き文字。</td>
  </tr>
</table>

*すべてのサムネイル案は、実績のある YouTube のパッケージング心理学を軸に設計しています。大胆な視覚的矛盾、明快なシルエット、スマホでも読みやすい文字を重視します。*

### キットの内容：

- **サムネイル画像**: 承認済みのキャラクター、画風、配色、物語の対立に合わせた横長 16:9 の画像 1 枚。対応する画像生成ツールが利用でき、必要な費用が承認されていれば直接生成します。
- **高クリック率を狙うタイトル 5 案**: 検索意図、好奇心を刺激する情報のギャップ、幅広い視聴者への訴求を考慮。
- **YouTube Studio の説明文＆SEO**: 内容の要約、関連タグ、最終動画または確認済みタイムラインに基づくタイムスタンプを用意。
- **固定コメント用フック**: 動画に関連した、自然な対話を促す質問 1 件。
- **公開前チェックリスト**: モバイルのセーフゾーン、コントラスト、内容の正確さ、素材の権利確認状況。Content-ID の通過や収益化資格は保証しません。

### 呼び出し方：

最終動画を承認すると、アシスタントがこの任意の仕上げパックを提案します。同意すれば続行し、不要なら動画の納品を遅らせずに終了できます。プロンプトのコピーは不要です。直接依頼することもできます：

```text
この動画のサムネイル＆公開キットを生成してください：
- 承認済みの画風に合う、横長 16:9 のサムネイル画像 1 枚
- YouTube タイトル 5 案
- 説明文、関連タグ、根拠がある場合は確認済みタイムスタンプ
- 固定コメント用の、反応を引き出す質問 1 件
- 未確認項目を明記した公開前チェックリスト
```

*画像生成には利用可能なツールと必要な費用承認が必要です。利用できない場合は制約を説明し、テキスト部分を先に納品します。承認済み脚本から先に依頼した場合は下書きとし、最終動画に依存する確認は保留します。画像をダウンロードし、文章を YouTube Studio や TikTok に必要に応じてコピーしてください。自動アップロード・公開は行いません。*

<!-- thumbnail-publishing-kit:end -->

<!-- readme:reliability -->

<a id="faq"></a>

## ❓ よくある質問

### Q1. 本当に100%無料ですか？ 隠れた料金はありますか？

はい。Stickman Video Director は MIT ライセンスの100%無料・オープンソースプロジェクトです。個人利用にも商用プロジェクトにも自由に使えます。月額30〜60ドルを請求する独自の SaaS プラットフォームとは異なり、本プロジェクトにサブスク料金はありません。接続するモデルに応じて、Google Gemini、Claude、ElevenLabs などの外部 API の利用料金だけをご自身で支払います。

### Q2. YouTube や TikTok で収益化できますか？

はい、できます。顔出しなしのクリエイターが気にするのは、YouTube の「Reused Content（再利用されたコンテンツ）」や低労力の AI コンテンツに対する収益化停止ポリシーです。Stickman Video Director は独自のストーリー展開、語りのテンポ、オリジナルの画面演出を作るため、出力は完全にオリジナルです。数百のチャンネルが YouTube Partner Program（YPP）で棒人間の物語動画を収益化しています。

### Q3. プログラミングの知識や高価な GPU は必要ですか？

いいえ。ハイエンドの RTX グラフィックカードも、プログラミングの知識も不要です。

- **Director Mode** は Skill 対応の AI アシスタント内で、会話形式で利用できます。
- **Autopilot Mode** は Claude Code、Codex、Cursor などの AI コーディングエージェント内で、簡単な英語の指示で動作します。負荷の高いビジュアル生成は軽量なクラウド API や手続き型レンダリングが処理し、手元のハードウェアでは行いません。

### Q4. 台本がなくても動画を作れますか？

はい。大まかなアイデア、ふと思いついたこと、ニュースのリンク、ブログ記事全文を貼り付けるだけでも始められます。AI ディレクターが中心となる対立を抽出し、引きつける3秒のフックを作り、笑いの間とナレーションの指示を備えた、テンポのよい6シーンの物語に構成します。

<!-- readme:platforms -->

### Q5. Director Mode と Autopilot Mode はどう選べばよいですか？

- **Director Mode を選ぶ**：すべてのショット、カメラアングル、視覚的な比喩を細かくコントロールしたい場合。動画のフレームを生成する前に、台本と絵コンテを無料で確認できるため、予算の安全網になります。
- **Autopilot Mode を選ぶ**：手間をかけず、ワンクリックで台本、ナレーション、字幕、完成動画ファイルまで自動生成したい場合。

### Q6. 退屈さを避け、視聴者が見続ける動画にする仕組みは？

一般的な AI ツールは文章をそのまま絵にするだけです。Stickman Video Director は本格的な**視覚的ストーリーテリングの心理学**を活用します：

- **3秒のフック**：最初の一文を、すぐに伝わる視覚的な矛盾や好奇心を刺激する謎に変え、スクロールを止めます。
- **視覚的な比喩**：退屈な抽象概念を視覚的なギャグに変えます。不安を縮んでいくハムスターの回し車で、燃え尽きを残量1%のバッテリーで表現する、といった方法です。
- **テンポと笑いの間**：構造化された間、リアクションショット、効果音の指示（SFX）を挿入し、Casually Explained のようなクリエイターの笑いのテンポを再現します。

### Q7. どの AI アシスタントと動画編集ソフトに対応していますか？

- **AI 環境**：Claude Code、OpenAI Codex、Cursor、Antigravity など、ファイルとターミナルにアクセスできるエージェント環境。
- **動画生成ツール**：Google Flow、Runway（Gen-3）、Luma Dream Machine、Kling、Pika などの画像から動画・テキストから動画を生成するモデル。
- **動画編集ソフト**：プロンプトと書き出した音声は、CapCut、Premiere Pro、DaVinci Resolve、Final Cut にドラッグ＆ドロップできます。

### Q8. 特定のシーンが気に入らない場合、全編をレンダリングし直す必要がありますか？

いいえ！ それが6シーンのモジュール型構成の大きな利点です。シーン3を調整するなら、そのシーンのプロンプトだけを修正します。シーン1、2、4、5、6はそのまま維持されます。編集時間を80%節約し、生成クレジットの無駄をなくします。

<!-- readme:contribute -->

<a id="road-to-10000-stars--creator-ecosystem"></a>

## ⭐ 10,000 Starsへの道とクリエイターエコシステム

**一つひとつのStarが、次のリリースの力に！** 月額50ドルのSaaSを契約せずに、一人でも顔出しなしのチャンネルを運営できるよう、100%無料・オープンソースのスタジオをみんなで作っています。

- [x] **1,000 Stars**：Directorモード + 5つの基本画風を公開
- [x] **3,000 Stars**：ワンクリックで動画を生成するAutoPilotモードを公開
- [ ] **🔥 5,000 Stars**：
  - 5–10種類の新しい画風を追加
  - YouTube Shorts・TikTok向けのワンクリック一括編集ツール
- [ ] **7,500 Stars**：
  - 1,000本以上のバイラルYouTube台本用プロンプト集
  - 200種類以上のロイヤリティフリーでContent IDにも安心な効果音・トランジション
- [ ] **10,000 Stars**：公式オールインワンWeb Studioを公開

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="kaomei/stickman-video-directorのGitHub Star数の推移" width="800">
  </picture>
</a>
</div>

<a id="whats-next"></a>

## 🔮 追加予定の画風

顔出しなしのYouTubeで特に要望の多いジャンルに向けて、新しい専用エンジンをトレーニングしています：

- **OverSimplified風の歴史・伝承** — 小さな歴史上の人物、征服を示す矢印、風刺的な戦況マップ
- **棒人間バトルとスピード線** — Alan Becker風のダイナミックな戦闘、武術、インパクトフレーム
- **ダーク心理学とストイック・ノワール** — 陰影のあるシルエット、光る目、『権力に翻弄されないための48の法則』風の語り
- **ウォール街とシリコンバレーのパロディ** — スーツにネクタイの棒人間、暴落するチャート、企業への皮肉
- **2マイクのポッドキャストとスタンドアップ** — テンポのよい会話コメディ、インタビューの再構成、キャラクターの掛け合い
- **ネットの謎と都市伝説** — 不気味な鉛筆画、アナログ映像の乱れ、Reddit発のミステリー

## 💬 コミュニティと作品投稿

画風を提案したい方、自分のチャンネルを紹介してほしい方は、Telegramの **[@CrazyKaomei](https://telegram.me/CrazyKaomei)** へ：

- **画風をリクエスト**：見た目の参考リンク + 扱いたいジャンルを送ってください。
- **作品を紹介**：このツールで動画を作りましたか？リンクを送ると、このREADMEや公式YouTubeチャンネルで紹介できます！

🔔 *Xで **[@CrazyKaomei](https://x.com/CrazyKaomei)** をフォローして、日々の動画制作フロー、自動化ツール、チャンネル成長のSOPをチェック。*

## 📄 ライセンス

[MIT License](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE)で公開しています。無料での利用、改変、商用利用、再配布が可能です。本プロジェクトまたはその重要な部分を配布する際は、著作権表示とライセンス文を残してください。

本プロジェクトは現状のまま、無保証で提供されます。詳細は [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE) をご確認ください。
