# Doktori Curator

독서동호회 운영을 위한 슬랙 워크플로우와 커스텀 스텝을 제공하는 앱입니다.

## 기능

이 앱은 다음과 같은 커스텀 스텝을 제공합니다:

### 1. 도서 투표 생성 (CreatePollFunction)

- 줄바꿈으로 구분된 도서 목록으로 숫자 이모지 투표를 생성합니다
- 각 도서에 숫자 이모지가 자동으로 추가되고, 리액션을 통해 투표를 진행할 수 있습니다
- 최대 10권까지 한 번에 투표 가능합니다

### 2. 도서 요약 작성 (BookSummaryFunction)

- 독서 모임에서 읽은 책의 요약을 작성하고 공유할 수 있습니다
- 서식이 있는 메시지로 책 제목, 저자, 요약 내용을 보기 좋게 표시합니다
- 작성자 정보가 메시지에 포함됩니다

## 설치 및 실행

### 필수 요구사항

이 앱은 Slack 유료 플랜 워크스페이스에서만 작동합니다.

### Slack CLI 설치

[슬랙 CLI 설치 가이드](https://api.slack.com/automation/quickstart)를 따라 CLI를 설치합니다.

### 앱 실행하기

```zsh
# 앱을 로컬에서 실행
$ slack run

Connected, awaiting events
```

로컬 실행을 중지하려면 `<CTRL> + C`를 누르세요.

## 트리거 생성하기

워크플로우를 실행하려면 트리거가 필요합니다. 커스텀 스텝은 Workflow Builder에서 사용할 수 있지만, 직접 워크플로우를 만들 경우 트리거가 필요합니다.

```zsh
$ slack trigger create --trigger-def triggers/<YOUR_TRIGGER_FILE>.ts
```

## 앱 배포하기

개발이 완료되면 `slack deploy` 명령을 사용하여 앱을 배포합니다:

```zsh
$ slack deploy
```

## 프로젝트 구조

### `functions/`

- `create_poll.ts`: 도서 투표 생성 기능
- `book_summary.ts`: 도서 요약 작성 기능

### `manifest.ts`

앱의 구성이 포함된 매니페스트 파일입니다. 앱 이름, 설명 및 기능 등이 정의되어 있습니다.

## 라이센스

이 앱은 MIT 라이센스 하에 제공됩니다.

## 리소스

Slack 자동화에 대해 더 알아보려면 다음 리소스를 참조하세요:

- [자동화 개요](https://api.slack.com/automation)
- [CLI 빠른 참조](https://api.slack.com/automation/cli/quick-reference)
- [샘플 및 템플릿](https://api.slack.com/automation/samples)
