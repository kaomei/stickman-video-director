<!-- readme:hero -->

<div align="center">

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [**한국어**](README.ko.md) · [Português do Brasil](README.pt-BR.md)

# Stickman Video Director

### 어떤 아이디어든, 1분 내내 살아 움직이는 스틱맨 영상으로.

하나의 Codex Skill이 원문을 확인 가능한 영어 내레이션, 영상 중심의 디렉터 제안서, 그리고 바로 제작에 사용할 수 있는 6개의 Gemini Omni Flash 프롬프트로 바꿔 줍니다.

![Codex Skill](https://img.shields.io/badge/Codex-Skill-111827?style=flat-square)
![Gemini Omni Flash](https://img.shields.io/badge/Gemini-Omni%20Flash-6d28d9?style=flat-square)
![1분 영상](https://img.shields.io/badge/Video-≈60%20seconds-0066ff?style=flat-square)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

**YouTube Shorts, TikTok, Instagram Reels, YouTube**에 올릴 시각적 설명 영상, 동기부여 스토리, 교육용 숏폼, 빠른 템포의 비주얼 에세이에 맞춰 설계되었습니다.

</div>

<!-- readme:demos -->

## 두 가지 고대비 스타일, 하나의 일관된 영상 언어

| 라이트 테마 | 다크 테마 |
|:---:|:---:|
| <!-- demo:light:start --><img src="assets/readme/light-theme-preview-placeholder.svg" alt="흰 배경, 검은 스틱맨, 고채도 포인트 컬러의 라이트 테마 미리보기" width="600"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="assets/readme/dark-theme-preview-placeholder.svg" alt="검은 배경, 흰 스틱맨, 고채도 포인트 컬러의 다크 테마 미리보기" width="600"><!-- demo:dark:end --> |
| 흰 캔버스 · 검은 인물 | 검은 캔버스 · 흰 인물 |

> 라이트·다크 테마의 실제 영상 클립은 곧 추가됩니다. 업데이트를 계속 보고 싶거나 더 많은 크리에이터가 이 프로젝트를 발견하길 바란다면 Star를 눌러 주세요.

## 대본이 있다고 해서 영상이 완성된 것은 아닙니다

좋은 아이디어도 한 인물, 한 배경, 그리고 10초 동안 거의 변하지 않는 평면적인 애니메이션이 될 수 있습니다. 1분 전체를 연출하려면 강한 훅, 설명의 속도, 내용과 연결된 시각적 은유, 카메라 움직임, 장면 연결, 여러 번의 독립 생성 사이에서 유지되는 일관성까지 설계해야 합니다.

**Stickman Video Director는 생성 크레딧을 쓰기 전에 이런 제작 판단부터 정리합니다.**

<!-- readme:advantages -->

## 숏폼 크리에이터에게 필요한 이유

| 장점 | 얻을 수 있는 결과 |
|---|---|
| **더 강한 이야기 구조** | 핵심 의미를 보존하면서 원문을 날카로운 시작, 단계적인 설명, 마지막 콜백으로 다시 구성합니다. |
| **실제 승인 단계** | 최종 모델 프롬프트를 만들기 전에 읽기 쉬운 6개 장면의 디렉터 제안서를 보여 줍니다. 수정 비용이 낮을 때 이야기를 바꿀 수 있습니다. |
| **풍부하고 관련성 높은 움직임** | 클립마다 3개의 시간 구간을 설계하고 시각적 은유, 환경 변화, 카메라 이동, 텍스트 순간, 상호작용, 전환, BGM, SFX를 배치합니다. |
| **제작 조건 고정** | 캐릭터, 선 굵기, 팔레트, 목소리, 대사, 오디오, 전환, 네거티브 조건을 모든 독립 프롬프트 안에 반복합니다. |
| **화면 비율에 맞춘 연출** | `9:16`, `16:9`, `1:1`에 맞춰 배치, 카메라 경로, 텍스트 위치를 다시 설계하며 비율 표기만 바꾸지 않습니다. |
| **통제 가능한 고대비 스타일** | 흰 배경·검은 인물, 검은 배경·흰 인물과 함께 최대 3개의 고채도 포인트 컬러를 사용할 수 있습니다. |
| **원문에 대한 충실성** | 근거 없는 사실, 통계, 인용문, 제품 주장을 새로 만들지 않습니다. |

API나 MCP 의존성이 없습니다. Skill을 설치하고 호출한 뒤, 대화형 안내에 따라 제작하면 됩니다.

<!-- readme:platforms -->

## 하나의 아이디어를 화면에 맞게 다시 구성

| 비율 | 적합한 용도 | 연출 포인트 |
|---|---|---|
| `9:16` | YouTube Shorts, TikTok, Instagram Reels | 세로 깊이, 강한 중앙 실루엣, 층층이 이어지는 공개, 모바일에서 읽기 쉬운 텍스트 |
| `16:9` | YouTube 설명 영상, 교육 콘텐츠, 비주얼 에세이 | 넓은 무대 배치, 좌우 카메라 이동, 분할 화면 비교, 넉넉한 여백 |
| `1:1` | 소셜 피드, 짧은 제품 스토리 | 강한 중앙 구도, 방사형 움직임, 읽기 편한 가장자리 여백 |

<!-- readme:workflow -->

## 붙여넣기 → 선택 → 승인 → 생성 → 연결

1. **붙여넣기:** 원고, 메모, 기사 또는 주제만 입력합니다.
2. **선택:** `16:9`, `9:16`, `1:1` 중 하나를 고르고 라이트 또는 다크 테마를 선택합니다.
3. **승인:** 영어 VO, 참고 번역, 화면, 카메라, 전환, BGM, SFX가 포함된 상세 디렉터 제안서를 확인합니다.
4. **생성:** 현재 제안서가 승인된 뒤, 독립적으로 사용할 수 있는 Gemini Omni Flash 프롬프트 6개를 받습니다.
5. **연결:** 약 10초짜리 클립 6개를 하나의 일관된 1분 영상으로 편집합니다.

화면 비율, 테마, 내레이션, 장면 구조, 팔레트, 목소리, 톤은 언제든 변경할 수 있습니다. 전체 설정이 바뀌면 Skill은 제안 단계로 돌아가 다시 승인을 요청합니다.

<!-- readme:output -->

## 최종 결과물

- 크리에이터용 영어 제목, 핵심 메시지, 훅, 분위기, 팔레트, 목소리, 음악 방향
- 약 1분 분량의 **영어 130–150단어 내레이션**
- 2~3초마다 분명한 변화가 있는 서로 다른 6개의 스토리보드 장면
- 정확한 영어 대사와 참고 번역
- 시간 구간과 네거티브 조건을 포함한 독립 Gemini Omni Flash 프롬프트 6개
- 클립 사이를 자연스럽게 잇는 서로 맞물린 끝 장면과 시작 장면
- BGM, 효과음, 일관성, 최종 편집 가이드

<details>
<summary><strong>요청 예시</strong></summary>

```text
Use $directing-stickman-videos to turn this copy into a one-minute English stickman video:

Gravity bends space and time so strongly around a black hole that even light cannot escape.
```

Skill은 먼저 빠진 화면 비율과 테마를 질문합니다. 이후 6개 장면의 디렉터 제안서를 보여 주며, 승인을 받기 전에는 최종 모델 프롬프트를 생성하지 않습니다.

</details>

<!-- readme:install -->

## 설치

저장소를 복제합니다.

```bash
git clone https://github.com/kaomei/stickman-video-director.git
cd stickman-video-director
```

설치 가능한 Skill 폴더를 Codex skills 디렉터리에 복사합니다.

```bash
cp -R skills/directing-stickman-videos "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Codex를 다시 시작해 Skill이 사용 가능한 목록에 나타나게 합니다. 그다음 Skill을 호출하고 원문을 붙여넣습니다.

```text
$directing-stickman-videos
```

<!-- readme:reliability -->

## 반복 수정에 강하고, 생성 차이에는 솔직하게

- **승인은 명확해야 합니다.** 현재 제안서를 승인하기 전에는 Phase B로 넘어가지 않습니다.
- **전체 변경은 재구성을 시작합니다.** 새로운 비율이나 테마는 문구만 기계적으로 바꾸는 대신 연출을 다시 설계합니다.
- **프롬프트는 독립적으로 작동합니다.** 각 클립을 단독 생성하는 데 필요한 핵심 고정 조건을 매번 반복합니다.
- **의미의 근거를 지킵니다.** 구조와 전달 방식은 강화할 수 있지만 근거 없는 주장은 추가하지 않습니다.
- **오디오는 조금 달라질 수 있습니다.** 독립 생성에서는 목소리나 음악이 미세하게 달라질 수 있습니다. 일관성을 최대화하려면 각 클립의 동기화된 SFX는 유지하고, 편집 시 하나의 연속 외부 VO와 BGM 트랙을 추가하세요.

## 저장소 구조

```text
skills/directing-stickman-videos/  설치 가능한 Skill
assets/readme/                     README 미리보기 미디어
tests/                             행동 시나리오와 검증
docs/superpowers/specs/            승인된 제품 설계
docs/superpowers/plans/            구현 계획
```

<!-- readme:contribute -->

## 함께 더 좋아지게 만들어 주세요

사용 사례, 예시, 프롬프트 개선, 실제 생성 기록을 환영합니다. 재현에 필요한 맥락을 담아 issue를 열거나 범위가 명확한 pull request를 보내 주세요.

이 Skill이 멈춰 있던 아이디어를 실제로 게시할 수 있는 영상으로 바꾸는 데 도움이 되었다면, **저장소에 Star를 남겨 주세요**. 같은 제작 흐름을 찾는 다음 크리에이터가 이 프로젝트를 발견하는 데 도움이 됩니다.

## 라이선스

MIT
