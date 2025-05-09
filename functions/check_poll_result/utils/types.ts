/**
 * 투표 결과 확인 도메인의 타입 정의
 */

import { BookGroup } from "./group_assignment_v2.ts";

/**
 * Slack API 응답에서 사용하는 리액션 객체 타입
 */
export interface SlackReaction {
  name: string;
  users: string[];
  count: number;
}

/**
 * 리액션 정보를 가진 사용자 정보
 */
export interface ReactionUser {
  bookIndex: number; // 책 인덱스 (0부터 시작)
  userId: string; // 사용자 ID
  bookTitle: string; // 책 제목
}

/**
 * 그룹 할당 결과
 */
export interface GroupAssignmentResult {
  bookGroups: BookGroup[];
}
