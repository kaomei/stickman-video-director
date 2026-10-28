<div align="center">

[🇺🇸 EN](README.en.md) · [🇨🇳 简中](README.zh-CN.md) · [🇯🇵 日本語](README.ja.md) · [**🇰🇷 한국어**](README.ko.md) · [🇫🇷 FR](README.fr.md) · [🇧🇷 PT-BR](README.pt-BR.md) · [🇹🇷 TR](README.tr.md) · [🇮🇩 ID](README.id.md)

# 🎬 Stickman Video Director

**어떤 대본이든 얼굴 공개 없는 YouTube 채널을 위한 다양한 그림체의 바이럴 스틱맨 애니메이션 영상으로. 완전한 오픈소스.**

[![GitHub Stars](https://img.shields.io/github/stars/kaomei/stickman-video-director?style=flat-square)](https://github.com/kaomei/stickman-video-director/stargazers)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

주제, 글, 링크만 주면 화면, 내레이션, 자막, 효과음, 부분 애니메이션을 자동으로 제작해 한 편의 스틱맨 영상을 완성합니다. **얼굴을 공개하지 않아도, 개성이 뚜렷한 YouTube 채널을 만들 수 있습니다.**

온라인에서 인기 있는 스틱맨 그림체를 모아 꾸준히 업데이트하고 오픈소스로 공개합니다. **지식·과학 해설, 심리·자기계발, 교육·캠페인, 공감·힐링, 인기 스토리 등 다양한 콘텐츠 분야에 활용할 수 있습니다.**

</div>

<table width="100%">
<tr>
<td width="50%" align="center">
<strong>클래식 흑백 스타일</strong><br>
<a href="#a1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="클래식 흑백 스틱맨 애니메이션: 검은 배경과 흰 선으로 전달하는 지식·정보" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>모던 팝 스타일</strong><br>
<a href="#a2"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="모던 팝 스틱맨 애니메이션: 빨간 비니 캐릭터와 테크 조명 연출" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>선사시대 동굴 스타일</strong><br>
<a href="#a3"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="선사시대 동굴 스틱맨 애니메이션: 동굴을 배경으로 한 반전 이야기" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>따뜻한 일상 이야기 스타일</strong><br>
<a href="#a4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="따뜻한 일상 스틱맨 애니메이션: 다채로운 배경과 공감 가는 순간" width="90%"></a>
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>역사 카툰 스타일</strong><br>
<a href="#style-5"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan-hero.gif" alt="역사 카툰 스틱맨 애니메이션: 에도 시대 사무라이 이야기" width="90%"></a>
</td>
<td width="50%" align="center">
<strong>미니멀 손그림 스타일</strong><br>
<a href="#b1"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="미니멀 손그림 스틱맨 영상: 생생한 표정, 핵심 문구, 부분 애니메이션" width="90%"></a>
</td>
</tr>
</table>

<div align="center">

**6가지 스타일 · 8가지 비주얼 옵션 · 실제 제작 예시 · 무료 오픈소스**

⭐ **새로운 스타일을 계속 추가합니다. Star로 저장하고 다음 영상에 활용해 보세요.**

[시작하기](#quick-start) · [A 스타일](#a-styles) · [B 스타일](#b-styles) · [자주 묻는 질문](#faq)

</div>

<a id="creation-modes"></a>

## 두 가지 영상 제작 모드

**장면마다 세밀하게 연출하려면 A · Director 모드, 긴 영상을 일일이 조립하지 않고 만들려면 B · Autopilot 모드.** 하나의 프로젝트에서 두 가지 제작 방식을 선택할 수 있습니다.

|  | <div align="center">A · Director 모드</div> | <div align="center">B · Autopilot 모드</div> |
|:---:|:---|:---|
| **특징** | **AI가 연출을 제안하고, 최종 결정은 직접**: 스토리보드와 프롬프트를 받아 클립 생성과 편집을 조정합니다. | **주제나 요구사항에서 완성 영상까지**: 일러스트, 내레이션, 자막, 부분 애니메이션, 영상 합성을 자동으로 진행합니다. |
| **길이** | **짧은 영상에 우선 추천**. 30초~3분이 좋은 출발점이며, 구간을 이어 더 긴 콘텐츠도 만들 수 있습니다. | **긴 영상에 우선 추천**. 특히 **10분 이상**의 내레이션 영상에 적합하며, 짧은 영상이나 연속 스토리도 만들 수 있습니다. |
| **필요한 환경** | Skill을 지원하는 AI 어시스턴트에서 기획안을 만들고, **Google Flow** 등으로 클립을 생성한 뒤 **CapCut** 등에서 편집합니다. | **Codex, Claude Code**처럼 파일을 읽고 쓰고, 도구를 호출하고, 명령을 실행할 수 있는 AI 에이전트에서 소재 생성과 로컬 영상 합성을 연결합니다. |
| **화면 구성** | **구간별 애니메이션 생성**: 인물의 동작, 카메라 연출, 캐릭터 간 상호작용을 중시합니다. | **일러스트 스토리보드＋부분 애니메이션**: 장면 전환, 줌, 팬을 내레이션에 맞춰 구성합니다. 매번 전체 동작 영상을 생성하지 않아도 이야기를 전할 수 있습니다. |
| **결과물** | 연출 기획안, 스토리보드, 구간별 영상 프롬프트, 사운드 디자인. | **내레이션·자막·부분 애니메이션이 포함된 완성 영상 파일**. |
| **시작하기** | <div align="center"><a href="#director-start">Director 모드 사용하기</a></div> | <div align="center"><a href="#autopilot-start">Autopilot 모드 사용하기</a></div> |

두 모드 모두 **주제, 원고, 완성된 대본**으로 시작할 수 있습니다. **A와 B는 스타일 번호와 화면을 공유하지 않고 각각 관리합니다. 새로운 스타일과 예시도 해당 시리즈에 추가합니다.** 화면 비율, 내레이션 언어, 음색은 필요에 따라 선택하세요. 위의 영상 길이는 선택을 돕기 위한 권장 사항이며 제한이 아닙니다.

Autopilot 모드에는 사용 가능한 이미지 생성·음성 합성 서비스와 로컬 영상 합성 환경이 필요합니다. 일반 채팅 창만으로는 이 실행 환경을 대신할 수 없습니다. Skill은 무료 오픈소스지만 연동 서비스에는 별도 요금이 발생할 수 있습니다.

<a id="quick-start"></a>

## 시작하기

아래 문장을 Skill을 지원하는 AI 어시스턴트에 보내세요. 설치가 끝나면 **각 모드로 무엇을 만들 수 있는지, 어떻게 시작하는지** 설명하고 그대로 사용할 수 있는 요청 예시를 안내합니다.

```text
이 Skill을 설치해 줘:
https://github.com/kaomei/stickman-video-director

설치가 끝나면 바로 설치된 SKILL.md를 읽고,
두 모드의 결과물, 필요한 도구, 제작 과정을 쉽게 설명해 줘.
그대로 따라 말할 수 있는 요청 예시도 알려 줘.
내가 만들려는 영상에 맞춰 무엇이 부족한지,
다음에 구체적으로 무엇을 하면 되는지도 안내해 줘.
```

<a id="director-start"></a>

### A · Director 모드: 구간별 영상 프롬프트 만들기

설치 후 아래 내용을 AI 어시스턴트에 보내고, 주제만 바꿔 보세요.

```text
Director 모드/A 모드로 아래 주제, 원고 또는 요구사항을
스틱맨 영상으로 만들어 줘:
[주제를 적거나 원고를 붙여 넣고, 원하는 내용을 설명해도 돼]

조건: 가로 16:9, A3 '선사시대 동굴 스타일', 우선 30초.
먼저 연출 기획안을 보여 주고, 내가 확인한 뒤 구간별 영상 프롬프트를 작성해 줘.
```

**제작 흐름: 주제와 요구사항 전달 → 이야기 대본 작성 → 필요에 따라 캐릭터 3면도 확인 → 상세 스토리보드 프롬프트 작성 → 직접 클립을 생성하고 편집해 완성**

기획안에는 이야기 구조, 구간별 내레이션, 인물 동작, 카메라 연출, 사운드 디자인이 포함됩니다. 프롬프트를 확인한 뒤 [Google Flow](https://flow.google.com/) 등 영상 생성 도구에 순서대로 입력하고, CapCut 등에서 자막을 넣고 편집합니다.

처음이라면 [전체 제작 가이드·중국어](https://x.com/CrazyKaomei/status/2102311241046008268)를 따라 한 번 완성해 보세요.

<a id="autopilot-start"></a>

### B · Autopilot 모드: 한 줄의 요청에서 롱폼 영상까지

Codex, Claude Code처럼 파일을 다루고 명령을 실행할 수 있는 환경에 설치한 뒤, 이렇게 요청하세요.

```text
Autopilot 모드/B 모드로 아래 주제, 기사, 게시물, 뉴스 또는 구체적인 요구사항을
YouTube에서 시선을 끌 수 있는 영상으로 만들어 줘:
[내용이나 링크를 붙여 넣거나, 소개·홍보하고 싶은 내용을 설명해 줘]

조건: 5~10분, 가로 16:9, B1 '미니멀 손그림 스타일'. 내레이션, 자막, 효과음을 넣어 줘.

먼저 이미지 생성, 음성 합성, 영상 합성 설정을 확인하고 대본을 보여 줘. 영상과 음성이 포함된 20초 미리보기도 만들어 줘.
내가 확인하면 화면을 내레이션의 흐름에 맞춰 전체 영상으로 자동 완성해 줘.
내가 클립을 하나씩 생성하거나 이어 붙이지 않아도 되도록 완성 영상 파일로 전달해 줘.
```

**제작 흐름: 주제·내용·요구사항 전달 → 영상 대본 확인 → 영상과 음성이 포함된 20초 미리보기 확인 → 전체 영상 자동 제작 → 완성 영상 받기**

AI 어시스턴트가 내용에 맞춰 스토리보드를 설계하고 화면과 내레이션을 생성합니다. 자막과 효과음을 더한 뒤 음성의 흐름에 맞춰 하나의 영상으로 합성합니다. 사용자는 주로 대본과 샘플을 확인하면 되며, 클립마다 직접 생성하거나 조립할 필요가 없습니다.

처음에는 필요한 설정을 확인하고, 무엇이 부족하며 어떻게 준비하면 되는지 단계별로 안내합니다. 화면이나 목소리가 마음에 들지 않으면 해당 부분만 수정하고 이미 확인한 부분은 유지할 수 있습니다.

<a id="style-gallery"></a>

<a id="a-styles"></a>

## A · Director 모드 스타일 모음

A1, A2, A3… 순으로 추가하며, 각 스타일에 맞는 애니메이션 예시를 소개합니다.

<a id="a1"></a>

### A1: 클래식 흑백 스타일

적은 선으로도 큰 개념을 명확하게 전달할 수 있습니다. 새하얗거나 새까만 화면에서 인물, 소품, 강조색이 이야기를 이끕니다. 빠르고 이해하기 쉬운 설명 영상에 잘 어울립니다.

- **화면 특징:** 둥근 머리, 선으로 된 팔다리, 일정한 선 두께에 간단한 표정을 더할 수 있습니다. 선명한 강조색은 최대 3개로 감정, 위험, 행동을 구분합니다. 불안을 감옥으로, 집중력을 게이지로 표현하듯 추상적인 개념을 장면으로 풀어냅니다.
- **추천 주제:** 과학 상식, 심리, 자기관리, 동기부여, 비즈니스 분석, 개념 설명.
- **선택 기준:** 흰 배경에 검은 스틱맨은 깔끔하고 직관적이어서 학습·정보 전달에 좋습니다. 검은 배경에 흰 스틱맨은 대비가 강해 긴장감, 갈등, 감정을 강조하기 좋습니다.

| A1.1 · 흰 배경·검은 스틱맨 | A1.2 · 검은 배경·흰 스틱맨 |
|:---:|:---:|
| <!-- demo:light:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/light-theme-demo.gif" alt="A1.1 · 흰 배경 위 검은 스틱맨 애니메이션" width="360"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/dark-theme-demo.gif" alt="A1.2 · 검은 배경 위 흰 스틱맨 애니메이션" width="360"><!-- demo:dark:end --> |
| 흰 캔버스 · 검은 캐릭터 | 검은 캔버스 · 흰 캐릭터 |

---

<a id="a2"></a>

### A2: 모던 팝 스타일

빨간 비니와 노란 티셔츠가 캐릭터의 트레이드마크입니다. 깔끔한 테크 공간에서 제품을 설명할 수도, 침실이나 거리, 자연 속에서 이야기를 펼칠 수도 있습니다.

- **화면 특징:** 빨간 모자와 노란 옷의 미니멀 캐릭터에 두 가지 무대를 더합니다. 미니멀 테크는 흰 공간, 은은한 격자, 떠 있는 유리 느낌의 UI, 청록·파랑 빛을 사용합니다. 컬러 스토리는 다채로운 배경과 영화 같은 조명, 공간감으로 이야기의 분위기를 만듭니다.
- **추천 주제:** 미니멀 테크는 AI 도구, 테크 제품, 사용법, 기능 소개에 적합합니다. 컬러 스토리는 성장 경험, 일상, 모험, 동기부여 이야기에 어울립니다.
- **선택 기준:** 도구나 방법을 설명하려면 미니멀 테크, 캐릭터의 경험을 따라가는 이야기라면 컬러 스토리를 선택하세요.

| A2.1 · 미니멀 테크 | A2.2 · 컬러 스토리 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2a-demo.gif" alt="A2.1 · 미니멀 테크 스타일 애니메이션" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-2b-demo.gif" alt="A2.2 · 영화 같은 컬러 배경의 스토리 애니메이션" width="360"> |
| 흰 공간 · 은은한 격자 · 청록 빛 | 컬러 배경 · 영화 같은 조명 · 이야기의 분위기 |

---

<a id="a3"></a>

### A3: 선사시대 동굴 스타일

스마트폰도 사무실도 없던 시대에 오늘의 고민을 가져가면 어떨까요? 동굴, 가죽옷, 모닥불, 과장된 표정으로 직장과 인간관계의 익숙한 모순을 반전 있는 이야기로 만듭니다.

- **화면 특징:** 거친 손그림 선, 흰색으로 채운 머리, 검은 팔다리, 가죽옷, 흙빛 배경. 인물 간 상호작용과 표정, 코미디의 타이밍을 살립니다. 성별과 나이는 이야기에 맞춰 정하며, 새 이야기마다 같은 얼굴을 쓸 필요는 없습니다.
- **추천 주제:** 선사시대 상상, 직장 풍자, 인간관계 관찰, 블랙코미디, 우화, 어린이 영어 이야기.
- **선택 기준:** 짧은 사건 뒤에 “그랬구나” 혹은 “이렇게 된다고?” 싶은 반전을 보여 주고 싶을 때 좋습니다. 현대의 관계를 원시 부족으로 옮기면 낯설면서도 익숙한 웃음이 생깁니다.

| 예시 1: 「인류 최초의 일자리는 어떻게 생겼을까?」 | 예시 2: 「인류가 처음 불을 발견한 날」 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-demo.gif" alt="「인류 최초의 일자리는 어떻게 생겼을까?」 애니메이션 미리보기" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-3-community-fire.gif" alt="불의 발견을 주제로 만든 커뮤니티 작품" width="360"> |
| 선사시대 이야기 · 직장 풍자 | 불의 발견 · 커뮤니티 작품 |

---

<a id="a4"></a>

### A4: 따뜻한 일상 이야기 스타일

아까워서 못 쓰는 머그잔, 바로 답해야 할 것 같은 메시지, 모처럼 나를 위해 비워 둔 오후. 단순한 캐릭터가 색감 있는 일상 속으로 들어가 동작, 표정, 카메라로 공감 가는 순간을 전합니다.

- **화면 특징:** 흰색으로 채운 둥근 머리, 길고 가느다란 몸통, 검은 팔다리, 자연스러운 작은 표정과 컬러 2D 배경. 넓은 화면으로 장소를 보여 주고, 클로즈업으로 망설임이나 안도감을 담고, 이동 촬영으로 다음 장면에 연결합니다.
- **추천 주제:** 일상 공감, 마음의 성장, 인간관계, 따뜻한 이야기, 습관 만들기, 어린이 영어.
- **선택 기준:** 보는 사람이 “내 얘기 같다”고 느낄 생활 속 한 장면을 담고 싶을 때 선택하세요. 색과 빛은 주제에 따라 바뀌며, 따뜻함뿐 아니라 불안과 피로, 새로운 시작도 표현합니다.

| 예시 1: 출근길에도 신경 쓰이는 메시지 | 예시 2: 나를 위한 시간을 되찾기 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-station.gif" alt="따뜻한 일상 이야기: 역에서 메시지 때문에 불안해하는 캐릭터" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-4-cozy-cafe.gif" alt="따뜻한 일상 이야기: 햇살 드는 야외 카페에서 쉬는 캐릭터" width="360"> |
| 역 · 걷는 인물을 따라가는 카메라 · 감정 클로즈업 | 야외 카페 · 따뜻한 빛 · 일상의 몸짓 |

---

<a id="style-5"></a>
<a id="a5"></a>

### A5: 역사 카툰 스타일

에도 거리를 걷는 사무라이, 고대 이집트 신전의 검은 고양이, 로마 야영지의 병사. 시대에 맞는 옷과 다채로운 배경, 예상 밖의 작은 사건을 더해 역사를 인물의 이야기로 풀어냅니다.

- **화면 특징:** 흰색으로 채운 둥근 머리, 검은 타원형 눈, 또렷한 윤곽선과 가느다란 팔다리. 시대별 의상에 부드러운 셀 셰이딩을 입히고 회화적인 배경을 사용합니다. 나라와 시대가 바뀌면 옷·건축·소품·음악을 바꾸되 인물을 그리는 방식은 유지합니다.
- **추천 주제:** 세계사, 흥미로운 역사 상식, 옛사람들의 일상, 역사 인물 이야기, 역사 소재 코미디.
- **선택 기준:** 지식을 나열하기보다 인물이 겪는 사건으로 보여 주고 싶을 때 좋습니다. 짧은 상황과 생생한 반응, 반전으로 설명을 자연스럽게 이어갈 수 있습니다.

| 예시 1: 에도 시대 사무라이의 일상 | 예시 2: 고대 이집트의 고양이와 미라 |
|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-japan.gif" alt="역사 카툰: 에도 거리에서 살아가는 사무라이" width="360"> | <img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@2697fac5e0466f44098148a52c9648697521b3d6/assets/readme/previews/style-5-egypt.gif" alt="역사 카툰: 고대 이집트 신전의 검은 고양이와 미라" width="360"> |
| 에도 거리 · 사무라이 의상 · 일상의 뜻밖의 순간 | 다채로운 신전 · 검은 고양이 · 역사 이야기 |

스타일·프롬프트 기여: [Lawal Ridwan / @leksautomate](https://github.com/leksautomate).

---

<a id="b-styles"></a>

## B · Autopilot 모드 스타일 모음

B1, B2, B3… 순으로 추가하며, 각 스타일의 일러스트 스토리보드와 부분 애니메이션으로 완성한 영상을 소개합니다. A 시리즈와는 별도로 관리합니다.

<a id="b1"></a>

### B1: 미니멀 손그림 스타일

화면이 내레이션을 따라 자연스럽게 이어집니다. 표정이 살아 있는 스틱맨, 색을 더한 손그림 소품, 눈에 띄는 핵심 문구로 지식과 이야기, 제품의 매력을 쉽고 재미있게 전달합니다.

- **화면 특징:** 흰색에 가까운 종이 바탕과 아주 옅은 격자, 검은 손그림 선에 소량의 컬러 소품을 더합니다. 표정, 부분 애니메이션, 자연스러운 전환, 효과음으로 흐름을 만들고 핵심 문구를 강조합니다. 자막은 내레이션에 맞춥니다.
- **추천 주제:** YouTube 지식·정보 영상, 심리와 성장, 직장 이야기, 교육 콘텐츠, 제품·서비스 홍보.
- **선택 기준:** 주제, 원고, 이야기 대본을 내레이션과 자막이 있는 완성 영상으로 만들고 싶을 때 선택하세요. 화면을 음성의 흐름에 맞춰 구성하므로 지속적인 설명과 긴 이야기에 잘 어울립니다.

움직이는 미리보기를 클릭하면 소리 있는 샘플을 보거나 다운로드할 수 있습니다.

<table width="100%">
  <tr>
    <th width="50%" align="center">예시 1: 얼굴 공개 없이 YouTube 시작하기</th>
    <th width="50%" align="center">예시 2: 왜 아무도 보지 않을까?</th>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="assets/readme/b1-minimal-handdrawn.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@fa0a68d1ccf9fd057230abab2af832f768debe86/assets/readme/previews/b1-minimal-handdrawn.gif" alt="B1 미니멀 손그림 예시 1: 얼굴을 공개하지 않는 YouTube 영상 제작을 소개하는 음성 포함 샘플" width="360"></a></td>
    <td width="50%" align="center"><a href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"><img src="https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@61e202ccecf9d9926cf76e13f3284181297729b8/assets/readme/previews/b1-minimal-handdrawn-2026-10-23.gif" alt="B1 미니멀 손그림 예시 2: Bodi 내레이션, 자막, 손그림 캐릭터, 부분 애니메이션이 담긴 음성 포함 샘플" width="360"></a></td>
  </tr>
  <tr>
    <td align="center">손그림 캐릭터 · 핵심 문구 · 부분 애니메이션</td>
    <td align="center">Bodi 내레이션 · 생생한 표정 · 부분 애니메이션</td>
  </tr>
</table>

---

<a id="b2"></a>

### B2: 준비 중…

스타일 소개, 전용 샘플 영상, 요청 예시를 이곳에 추가할 예정입니다.

<!-- readme:reliability -->

<a id="faq"></a>

## 자주 묻는 질문

### Q1. 대본이 없어도 영상을 만들 수 있나요?

네. 주제, 기사, 링크 또는 구체적인 요구사항을 주면 AI 어시스턴트가 먼저 영상 대본으로 정리합니다. 완성된 대본을 그대로 사용해도 됩니다. 목표 시청자, 게시할 플랫폼, 원하는 길이도 함께 알려 주세요.

### Q2. Director 모드의 스타일도 완전 자동으로 제작할 수 있나요? Director 모드는 왜 필요한가요?

현재 A 시리즈 스타일의 제작 과정은 비교적 독립적이지만, AI 어시스턴트의 도움을 받아 좋아하는 A 시리즈 스타일에 B 시리즈의 제작 과정을 접목해 직접 응용할 수 있습니다.

Director 모드를 유지하는 주된 이유는 영상 생성과 시행착오에 드는 비용을 관리하기 위해서입니다. 십여 분짜리 영상의 전체 분량을 한 차례 생성하는 데만 **미화 수십 달러 정도**가 들 수도 있고, 반복해서 다시 만들면 비용이 더 늘어납니다. 그래서 Director 모드는 구간별 생성·확인과 수동 편집을 유지합니다. 각 장면을 직접 연출하면서 먼저 결과를 확인한 뒤 계속 제작할지 결정할 수 있습니다.

### Q3. Director 모드에서 캐릭터의 모습이 달라지면 어떻게 하나요?

AI 어시스턴트에 “선택한 스타일에 맞는 스틱맨을 먼저 디자인하고, 3면도(정면·측면·후면)를 확인한 뒤 스토리보드 프롬프트를 만들어 줘”라고 요청할 수 있습니다. 나만의 캐릭터를 쓰고 싶을 때도 좋은 출발점입니다. 이미 확인한 캐릭터 참고 이미지가 있다면 재사용하고, 별도 디자인이 필요 없다면 이 단계는 건너뛰어도 됩니다.

참고 이미지를 지원하는 영상 생성 도구에서는 **클립을 생성할 때마다 확인한 캐릭터 이미지를 함께 첨부**하세요. 참고 이미지는 보조 수단으로, 기존 스토리보드 프롬프트를 대체하거나 선택한 스타일의 규칙을 바꾸지 않습니다. 마지막에는 각 클립의 캐릭터 모습이 일관적인지 확인해야 합니다.

### Q4. 꼭 Codex를 써야 하나요?

아니요. Director 모드는 Skill 설치와 사용을 지원하는 AI 어시스턴트에서 이용할 수 있습니다.

Autopilot 모드에는 Codex, Claude Code처럼 파일을 읽고 쓰며 명령을 실행할 수 있는 환경이 필요합니다. 이미지 생성·음성 합성 서비스와 필요한 로컬 프로그램도 설정해야 합니다.

<!-- readme:platforms -->

### Q5. 기사나 참고 자료를 더 매력적인 영상으로 만들려면 어떻게 하나요?

누구의 관심을 끌고 싶은지, 무엇을 핵심으로 전달할지, 시청 후 어떤 행동을 기대하는지 AI 어시스턴트에 알려 주세요. 이를 바탕으로 주제의 관점을 잡고, 도입부의 후킹, 이야기 전개, 마지막 행동 유도를 설계한 뒤 스토리보드로 정리합니다.

좋아하는 영상이 있다면 참고 자료와 함께 마음에 든 템포, 표현 방식, 이야기 구조를 설명해 주세요. 기법은 참고하되 자신의 관점과 표현을 유지하는 것이 좋습니다. 역사, 비즈니스, 과학 관련 사실은 게시 전에 확인해야 합니다.

### Q6. 사용하려면 비용이 드나요?

Skill은 무료 오픈소스입니다. 이미지 생성, 음성 합성, 영상 생성 등의 요금은 선택한 플랫폼과 계정 요금제에 따라 달라집니다. 플랫폼의 유료 구독에 가입해도 API 사용량이 포함되는 것은 아닐 수 있습니다.

### Q7. 화면이나 목소리가 마음에 들지 않으면 전부 다시 만들어야 하나요?

아니요. 먼저 대본과 제작 방향을 확인하고, 짧은 샘플에서 그림체, 캐릭터, 목소리, 자막, 템포를 점검한 뒤 전체 영상을 만드는 것이 좋습니다.

특정 구간만 어색하다면 그 부분부터 수정할 수 있습니다. 이미 확인한 음성과 소재를 재사용하면 재작업과 중복 생성을 줄일 수 있습니다.

### Q8. 만든 영상을 YouTube에 올리거나 상업적으로 사용해도 되나요?

프로젝트는 MIT 라이선스로 제공되며 상업적 이용이 가능합니다. 다만 영상에 사용하는 외부 이미지, 음악, 효과음, 음성 합성 서비스에는 각각의 이용 조건이 적용됩니다. YouTube 수익 창출 가능 여부는 플랫폼 심사에 따라 결정됩니다.

<!-- readme:contribute -->

## 더 많은 스타일, 더 넓어지는 창작의 가능성

⭐ **얼굴 공개 없이 YouTube 채널을 운영하고, 콘텐츠 수익화를 시도하고 싶나요?** 이 프로젝트를 Star로 저장하고 스틱맨 스타일, 영상 프롬프트, 자동 제작 워크플로를 활용해 보세요. “영상은 어떻게 만들지?”에서 멈추지 않고 채널을 시작할 수 있습니다.

🔔 **[@CrazyKaomei](https://x.com/CrazyKaomei)를 팔로우하세요**: 얼굴을 공개하지 않는 YouTube 영상 제작을 위한 자동화 워크플로와 실용적인 도구를 소개합니다. 대본, 내레이션, 이미지 생성, 편집을 연결해 반복 작업을 줄이고 혼자서도 꾸준히 제작할 수 있도록 돕습니다. 주제 발굴, 채널 성장, 콘텐츠 수익화 아이디어도 계속 공유합니다.

<a id="whats-next"></a>

🎨 **추가 예정 스타일**: 손그림 그림책, 그래피티 액션, 두 사람의 시트콤, 카드 게임 모험, 실사와 일러스트의 결합, 강의·설명형 연출. 아직 계획 단계입니다.

💬 **제안·작품 공유**: 새로운 스타일 요청, 작품 소개, 문제 제보는 Telegram의 [@CrazyKaomei](https://t.me/CrazyKaomei)로 편하게 연락해 주세요. 스타일 제안에는 참고 자료와 만들고 싶은 주제를, 작품 제출에는 영상·사용한 스타일·작가 링크를 함께 보내 주시면 소개와 크레딧 표기에 도움이 됩니다.

<div align="center">
<a href="https://www.star-history.com/?repos=kaomei%2Fstickman-video-director&amp;type=date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date&amp;theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date">
    <img src="https://api.star-history.com/svg?repos=kaomei/stickman-video-director&amp;type=Date" alt="kaomei/stickman-video-director의 GitHub Star 증가 그래프" width="800">
  </picture>
</a>
</div>

## 라이선스

[MIT License](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE)로 공개합니다. 무료 사용, 수정, 상업적 이용, 재배포가 가능합니다. 프로젝트 또는 주요 부분을 배포할 때는 저작권 표시와 라이선스 고지를 유지해 주세요.

프로젝트는 어떠한 보증 없이 현 상태로 제공됩니다. 전체 조건은 [LICENSE](https://github.com/kaomei/stickman-video-director/blob/main/LICENSE)를 확인해 주세요.
