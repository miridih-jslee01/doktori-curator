/**
 * 그룹 관련 메시지 포맷팅을 담당하는 모듈
 * 메시지 포맷팅만 담당하고 API 호출은 수행하지 않습니다.
 */
import { BookGroup } from "./group_assignment_v2.ts";
import { getFormattedDateAfterDays } from "../../_utils/date_utils.ts";

/**
 * 단일 그룹의 상태 메시지를 생성합니다.
 *
 * @param group 책 그룹 정보
 * @param personLimit 그룹당 인원 제한
 * @returns 포맷팅된 메시지
 */
export function createGroupStatusMessage(
  group: BookGroup,
  personLimit: number,
): string {
  // 사용자 멘션 생성
  const mentions = group.members.map((userId) => `<@${userId}>`).join(" ");

  // 그룹 메시지 생성 - 제목과 멘션을 함께 반환
  return `📚 *${group.bookTitle}* (${group.members.length}/${personLimit}명)\n${mentions}`;
}

/**
 * 발제자 모집 메시지를 생성합니다.
 *
 * @param deadlineDays 발제자 응답 대기 일수 (기본값: 7일)
 * @returns 포맷팅된 메시지
 */
export const createPresenterMessage = (
  deadlineDays: number = 7,
  bookTitle: string,
): string => {
  // 발제자 모집 마감일 설정
  const deadline = getFormattedDateAfterDays(deadlineDays);

  return `📝 *${bookTitle} 발제자 안내*
• ${bookTitle} 발제를 희망하시는 분은 *${deadline}까지 이 메시지에* :o: 이모지를 남겨주세요.
• 응답이 없을 경우에는 그룹 내에서 랜덤으로 선정됩니다!`;
};

/**
 * 투표 결과 요약 메시지를 생성합니다.
 *
 * @param totalParticipants 총 참여자 수
 * @param groupCount 생성된 그룹 수
 * @returns 포맷팅된 요약 메시지
 */
export function createSummaryMessage(
  totalParticipants: number,
  groupCount: number,
): string {
  return `📊 *도서 투표 결과*\n총 ${totalParticipants}명이 참여했습니다. ${groupCount}개 그룹이 생성되었습니다.`;
}
