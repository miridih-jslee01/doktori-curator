# 도서 투표 큐레이터

슬랙에서 도서 투표를 생성하고 투표 결과에 따라 그룹을 자동으로 구성하는 슬랙
워크플로우 앱입니다.

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

### 결과 표시 형식

1. 먼저 투표 결과 요약 메시지가 채널에 게시됩니다.

   ```
   📊 도서 투표 결과
   총 X명이 참여했습니다. X개 그룹이 생성되었습니다.
   ```

2. 이어서 각 그룹 정보가 채널에 별도 메시지로 게시됩니다.
   ```
   📚 도서명 (X/4명) ✅ 인원이 모두 찼습니다!
   @사용자1 @사용자2 @사용자3 @사용자4
   ```

## 프로젝트 구조

```
functions/
├── create_poll.ts - 도서 투표 생성 함수 (리다이렉트)
├── create_poll/ - 도서 투표 생성 도메인
│   ├── index.ts - 주요 함수 파일
│   └── utils/
│       └── poll_utils.ts - 투표 생성 관련 유틸리티
├── check_poll_result.ts - 투표 결과 확인 함수 (리다이렉트)
├── check_poll_result/ - 투표 결과 확인 도메인
│   ├── index.ts - 주요 함수 파일
│   ├── types.ts - 타입 정의
│   ├── user_extractor.ts - 사용자 추출 모듈
│   ├── group_assignment.ts - 그룹 할당 모듈
│   ├── message_formatter.ts - 메시지 포맷팅 모듈
│   └── poll_service.ts - 투표 처리 메인 모듈
└── utils/ - 공유 유틸리티
    ├── arrays.ts - 배열 관련 순수 유틸리티
    └── emoji_mapping.ts - 숫자 이모지 매핑
```

## 설정 방법

1. 슬랙 워크플로우 빌더에서 새로운 워크플로우 생성
2. `CreatePollFunction`을 사용하여 투표 생성 스텝 추가
   - 채널 ID, 도서 목록, 인원 제한 수 입력
3. `CheckPollResultFunction`을 사용하여 투표 결과 확인 스텝 추가
   - `CreatePollFunction`의 출력값(channel_id, message_ts, person_limit,
     poll_items)을 입력값으로 연결

## 참고 사항

- 투표 생성 후 자동으로 숫자 이모지가 추가됩니다.
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
