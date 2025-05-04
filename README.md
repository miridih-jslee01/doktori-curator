# 독토리 큐레이터

슬랙에서 도서 투표를 생성하고 투표 결과에 따라 그룹을 자동으로 구성하며, 각
그룹의 발제자를 선정하는 슬랙 워크플로우 앱입니다.

## 주요 기능

### 1. 도서 투표 생성 (`CreatePollFunction`)

- 줄바꿈으로 구분된 도서 목록으로 투표를 생성합니다.
- 각 도서에 숫자 이모지를 자동으로 추가합니다.
- 투표 마감 시간은 다음 날 같은 시간으로 자동 설정됩니다.
- 그룹당 인원 제한 수를 설정할 수 있습니다 (기본값: 4명).
- 채널의 모든 멤버에게 알림을 보냅니다 (`@channel`).

**사용 예시:**

```
도서1
도서2
도서3
```

### 2. 투표 결과 확인 및 그룹 구성 (`CheckPollResultFunction`)

- 투표 메시지에 달린 숫자 이모지 반응을 확인합니다.
- 각 도서별로 투표한 인원을 그룹화합니다.
- 인원 제한을 초과한 경우, 초과 인원을 랜덤으로 다른 그룹으로 재배치합니다.
- 최종 그룹 구성 결과를 채널에 직접 메시지로 게시합니다.
- 투표한 사용자들에게 멘션으로 알림을 보냅니다.
- 투표 생성 시 설정한 인원 제한 수를 자동으로 받아 사용합니다.

### 3. 발제자 선정 (`SelectPresenterFunction`)

- 각 책 그룹에서 랜덤으로 발제자 겸 진행자를 선정합니다.
- 선정된 발제자는 해당 그룹의 스레드에 알림 메시지로 공지됩니다.
- 선정 과정에서 공정성을 위해 무작위 선정 방식을 사용합니다.

### 결과 표시 형식

1. 투표 결과 요약 메시지:

   ```
   📊 *도서 투표 결과*
   총 X명이 참여했습니다. X개 그룹이 생성되었습니다.
   ```

2. 각 그룹 정보 메시지:

   ```
   📚 *도서명* (X/4명)
   @사용자1 @사용자2 @사용자3 @사용자4
   ```

3. 발제자 선정 결과 메시지 (그룹 스레드에 표시):
   ```
   📚 *도서명 발제자 선정 결과*
   @사용자1님이 랜덤으로 발제자 겸 진행자로 선정되었습니다! 🎉
   ```

## 프로젝트 구조

```
functions/
├── _types/ - 공통 타입 정의
│   └── book_group.ts - 책 그룹 관련 타입
├── _utils/ - 공통 유틸리티
│   ├── arrays.ts - 배열 관련 유틸리티 (셔플, 정렬 등)
│   └── emoji_mapping.ts - 숫자 이모지 매핑 정보
├── _validators/ - 공통 데이터 검증 모듈
│   └── book_group_validator.ts - 책 그룹 데이터 검증
├── create_poll/ - 도서 투표 생성 도메인
│   ├── index.ts - 주요 함수 파일
│   └── utils/
│       └── poll_utils.ts - 투표 생성 관련 유틸리티
├── check_poll_result/ - 투표 결과 확인 도메인
│   ├── index.ts - 주요 함수 파일
│   └── utils/
│       ├── group_processor.ts - 그룹 처리 및 정렬
│       ├── message_formatter.ts - 메시지 포맷팅
│       ├── poll_service.ts - 투표 처리 메인 모듈
│       ├── reaction_processor.ts - 이모지 반응 처리
│       └── types.ts - 도메인별 타입 정의
└── select_presenter/ - 발제자 선정 도메인
    ├── index.ts - 주요 함수 파일
    └── utils/
        ├── message_formatter.ts - 발제자 선정 메시지 포맷팅
        └── presenter_service.ts - 발제자 선정 비즈니스 로직
```

## 설정 방법

1. 슬랙 워크플로우 빌더에서 새로운 워크플로우 생성
2. `CreatePollFunction`을 사용하여 투표 생성 스텝 추가
   - 채널 ID, 도서 목록, 인원 제한 수 입력
3. `CheckPollResultFunction`을 사용하여 투표 결과 확인 스텝 추가
   - `CreatePollFunction`의 출력값(channel_id, message_ts, person_limit,
     poll_items)을 입력값으로 연결
4. `SelectPresenterFunction`을 사용하여 발제자 선정 스텝 추가
   - `CheckPollResultFunction`의 출력값(book_groups)을 입력값으로 연결

## 참고 사항

- 봇 메시지의 이름을 사용자 정의하려면 `chat.postMessage` 호출 시 `username`
  파라미터를 추가하세요.
- 투표 결과 확인은 스케줄링을 통해 마감 시간 이후에 자동으로 실행되도록 설정할
  수 있습니다.
- 인원제한은 워크플로우 실행 시 파라미터로 지정할 수 있습니다.
- 사용자 멘션이 제대로 작동하기 위해 필요한 권한(users:read, reactions:read
  등)이 설정되어 있습니다.

## 설치 및 실행

### 필수 요구사항

이 앱은 Slack 유료 플랜 워크스페이스에서만 작동합니다.

### Slack CLI 설치

[슬랙 CLI 설치 가이드](https://api.slack.com/automation/quickstart)를 따라 CLI를
설치합니다.

### 앱 실행하기

```zsh
# 앱을 로컬에서 실행
$ slack run

Connected, awaiting events
```

로컬 실행을 중지하려면 `<CTRL> + C`를 누르세요.

## 앱 배포하기

개발이 완료되면 `slack deploy` 명령을 사용하여 앱을 배포합니다:

```zsh
$ slack deploy
```

## 라이센스

이 앱은 MIT 라이센스 하에 제공됩니다.

## 리소스

Slack 자동화에 대해 더 알아보려면 다음 리소스를 참조하세요:

- [자동화 개요](https://api.slack.com/automation)
- [CLI 빠른 참조](https://api.slack.com/automation/cli/quick-reference)
- [샘플 및 템플릿](https://api.slack.com/automation/samples)
