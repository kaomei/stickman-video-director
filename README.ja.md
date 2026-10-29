<div align="center">

[🇺🇸 EN](README.en.md) · [🇨🇳 简中](README.zh-CN.md) · [**🇯🇵 日本語**](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**どんな脚本も、顔出しなしのYouTubeチャンネルでバズる、多彩な画風の棒人間アニメ動画に。完全オープンソース。**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

テーマや記事、リンクを渡すだけで、映像・ナレーション・字幕・効果音・細かなアニメーションを自動で制作し、一本の棒人間動画に仕上げます。**顔出しなしでも、個性が伝わるYouTubeチャンネルを作れます。**

ネットで人気の棒人間の画風を集め、継続的に更新しながらオープンソースで公開しています。**知識・科学の解説、心理学・自己啓発、教育・啓発、心を癒やすストーリー、話題の物語など、幅広いジャンルに活用できます。**

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
</table>

<div align="center">

**6つの画風 · 8つのビジュアル · 制作例あり · 無料・オープンソース**

⭐ **画風はこれからも追加予定。Starで保存して、次の動画作りに役立ててください。**

[使い始める](#quick-start) · [Aの画風](#a-styles) · [Bの画風](#b-styles) · [よくある質問](#faq)

</div>

<a id="creation-modes"></a>

## 動画の作り方は2通り

**カットごとの演出を調整したいならA · Directorモード。長めの動画を、クリップごとにつなぐ手間なく作りたいならB · Autopilotモード。** ひとつのプロジェクトで、2つの作り方を選べます。

|  | <div align="center">A · Directorモード</div> | <div align="center">B · Autopilotモード</div> |
|:---:|:---|:---|
| **特徴** | **AIが演出を提案し、仕上がりは自分で調整**：絵コンテとプロンプトを受け取り、クリップの生成と編集を行います。 | **テーマや要望から完成動画へ**：イラスト、ナレーション、字幕、部分アニメーション、動画の合成まで自動で進めます。 |
| **長さ** | **短編向け**。目安は30秒〜3分。クリップを重ねて、より長い内容も作れます。 | **長編向け**。特に**10分以上**のナレーション動画に。短編や連続ストーリーにも対応します。 |
| **必要な環境** | Skill対応のAIアシスタントで企画を作り、**Google Flow**などで動画を生成。**CapCut**などで編集します。 | **Codex、Claude Code**など、ファイルの読み書き・ツール呼び出し・コマンド実行ができるAIエージェントで、素材生成とローカルでの動画合成をつなぎます。 |
| **映像表現** | **クリップごとのアニメーション生成**。人物の動作、カメラワーク、キャラクター同士のやり取りを重視します。 | **イラスト絵コンテ＋部分アニメーション**。カットの切り替え、ズーム、パンをナレーションに合わせ、毎回フルアニメーションを生成せずに物語を伝えます。 |
| **受け取れるもの** | 演出プラン、絵コンテ、クリップごとの動画プロンプト、サウンドデザイン。 | **ナレーション・字幕・部分アニメーション付きの完成動画ファイル**。 |
| **始める** | <div align="center"><a href="#director-start">Directorモードを使う</a></div> | <div align="center"><a href="#autopilot-start">Autopilotモードを使う</a></div> |

どちらも**テーマ、原稿、完成済みの台本**から始められます。**AとBの画風は別々に番号を付けて管理し、映像も共有しません。新しい画風と制作例は、それぞれのシリーズに追加します。** 画面比率、ナレーションの言語、声は希望に合わせて選べます。長さは選び方の目安で、制限ではありません。

Autopilotモードには、利用可能な画像生成・音声合成サービスと、ローカルの動画合成環境が必要です。通常のチャット画面だけでは、この実行環境を代用できません。Skillは無料のオープンソースですが、連携サービスには別途料金がかかる場合があります。

<a id="quick-start"></a>

## 使い始める

次の文章をSkill対応のAIアシスタントに送ってください。インストール後に、**それぞれのモードでできることと始め方**を説明し、そのまま使える依頼文の例を案内します。

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

初めてなら、[制作ガイド（中国語）](https://x.com/CrazyKaomei/status/2102311241046008268)を参考に、ひと通り作ってみてください。

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

<a id="style-gallery"></a>

<a id="a-styles"></a>

## A · Directorモードの画風一覧

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

<a id="b-styles"></a>

## B · Autopilotモードの画風一覧

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

### B2：準備中…

画風の紹介、専用の制作例、依頼文の例をここに追加します。

<!-- readme:reliability -->

<a id="faq"></a>

## よくある質問

### Q1. 台本がなくても動画を作れますか？

はい。テーマ、記事、リンク、具体的な要望を渡すと、AIアシスタントがまず動画用の台本にまとめます。完成済みの台本を使っても構いません。誰に向けた動画か、投稿先、希望の長さも伝えると進めやすくなります。

### Q2. Directorモードの画風は全自動で使えますか？Directorモードがあるのはなぜですか？

現在、Aシリーズの画風は独自の制作フローを採用していますが、AIアシスタントに頼んで、好みのAシリーズの画風とBシリーズの制作フローを組み合わせ、自分でアレンジすることはできます。

Directorモードを残している主な理由は、動画生成と試行錯誤にかかる費用を抑えるためです。十数分の動画では、全編を一度生成するだけで **数十米ドル程度** かかる場合があり、作り直すたびに費用が増えます。そのため、Directorモードではクリップごとの生成・確認と手動編集を残しています。各ショットを自分で決められるうえ、まず仕上がりを確認してから、続きを制作するか判断できます。

### Q3. Directorモードで人物の見た目がそろわないときは？

AIアシスタントに「選んだ画風に合う棒人間を先にデザインし、三面図（正面・横・後ろ）を確認してから、絵コンテのプロンプトを出して」と依頼できます。自分だけのキャラクターを使いたい場合にもおすすめです。確認済みのキャラクター画像があれば再利用でき、個別のデザインが不要ならこの手順は省略できます。

参考画像に対応する動画生成ツールでは、**クリップを生成するたびに、確認済みのキャラクター画像を添付**してください。参考画像は補助であり、元の動画プロンプトを置き換えたり、画風のルールを変えたりするものではありません。仕上げに、クリップ間で人物の見た目がそろっているか確認してください。

### Q4. Codexでないと使えませんか？

いいえ。Directorモードは、Skillのインストールと実行に対応するAIアシスタントで使えます。

Autopilotモードには、CodexやClaude Codeなどファイルの読み書きとコマンド実行ができる環境が必要です。画像生成・音声合成サービスと、ローカルの必要なソフトウェアも設定してください。

<!-- readme:platforms -->

### Q5. 記事や参考資料から、見たくなる動画を作るには？

誰に見てほしいか、何を一番伝えたいか、視聴後にどんな行動を取ってほしいかをAIアシスタントに伝えてください。切り口を絞り、冒頭のつかみ、話の展開、最後の呼びかけを設計したうえで、絵コンテにまとめます。

好きな動画があれば、テンポ、語り方、物語の構成など、参考にしたい点も添えてください。手法を参考にしつつ、自分の視点と言葉を大切に。歴史、ビジネス、科学に関わる事実は、公開前に確認してください。

### Q6. 料金はかかりますか？

Skillは無料のオープンソースです。画像生成、音声合成、動画生成などの料金は、利用するサービスとアカウントのプランによって異なります。サービスの有料会員でも、APIの利用枠が含まれるとは限りません。

### Q7. 映像や声が気になったら、全部作り直す必要がありますか？

ありません。まず台本と制作方針を確認し、短いサンプルで画風、人物、声、字幕、テンポをチェックしてから全編を作るのがおすすめです。

一部だけが気になる場合は、その部分を優先して調整。確認済みの音声や素材を再利用すれば、手戻りや重複した生成を減らせます。

### Q8. YouTubeへの投稿や商用利用はできますか？

プロジェクトはMITライセンスで、商用利用が可能です。ただし、動画に使う第三者の画像、音楽、効果音、音声合成サービスについては、それぞれの利用条件に従ってください。YouTubeでの収益化の可否は、プラットフォームの審査によって決まります。

<!-- readme:contribute -->

## 10,000 Starsへの道とクリエイターエコシステム

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

## 追加予定の画風

顔出しなしのYouTubeで特に要望の多いジャンルに向けて、新しい専用エンジンをトレーニングしています：

- **OverSimplified風の歴史・伝承** — 小さな歴史上の人物、征服を示す矢印、風刺的な戦況マップ
- **棒人間バトルとスピード線** — Alan Becker風のダイナミックな戦闘、武術、インパクトフレーム
- **ダーク心理学とストイック・ノワール** — 陰影のあるシルエット、光る目、『権力に翻弄されないための48の法則』風の語り
- **ウォール街とシリコンバレーのパロディ** — スーツにネクタイの棒人間、暴落するチャート、企業への皮肉
- **2マイクのポッドキャストとスタンドアップ** — テンポのよい会話コメディ、インタビューの再構成、キャラクターの掛け合い
- **ネットの謎と都市伝説** — 不気味な鉛筆画、アナログ映像の乱れ、Reddit発のミステリー

## コミュニティと作品投稿

画風を提案したい方、自分のチャンネルを紹介してほしい方は、Telegramの **[@CrazyKaomei](https://telegram.me/CrazyKaomei)** へ：

- **画風をリクエスト**：見た目の参考リンク + 扱いたいジャンルを送ってください。
- **作品を紹介**：このツールで動画を作りましたか？リンクを送ると、このREADMEや公式YouTubeチャンネルで紹介できます！

🔔 *Xで **[@CrazyKaomei](https://x.com/CrazyKaomei)** をフォローして、日々の動画制作フロー、自動化ツール、チャンネル成長のSOPをチェック。*

## ライセンス

[MIT License](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE)で公開しています。無料での利用、改変、商用利用、再配布が可能です。本プロジェクトまたはその重要な部分を配布する際は、著作権表示とライセンス文を残してください。

本プロジェクトは現状のまま、無保証で提供されます。詳細は [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE) をご確認ください。
