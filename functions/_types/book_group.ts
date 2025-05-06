/**
 * 책 그룹 관련 공통 타입 정의
 */

/**
 * 책 그룹 정보 인터페이스
 */
export interface BookGroup {
  bookTitle: string; // 책 제목
  members: string; // 쉼표로 구분된 멤버 ID 목록
  thread_ts: string; // 스레드 타임스탬프
  presenter_message_ts?: string; // 발제자 모집 메시지 타임스탬프
}
