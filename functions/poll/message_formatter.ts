/**
 * 그룹 관련 메시지 포맷팅을 담당하는 모듈
 */
import { BookGroup } from "./types.ts";

/**
 * 그룹 상태 메시지를 생성합니다.
 *
 * @param group 책 그룹 정보
 * @param personLimit 그룹당 인원 제한
 * @returns 포맷팅된 메시지
 */
export function createGroupStatusMessage(
  group: BookGroup,
  personLimit: number,
): string {
  // 그룹 상태 표시 (인원제한 충족 또는 미달)
  const groupStatus = group.isFull
    ? "✅ 인원이 모두 찼습니다!"
    : "⚠️ 인원이 부족합니다";

  // 사용자 멘션 생성
  const mentions = group.members.map((userId) => `<@${userId}>`).join(" ");

  // 그룹 메시지 생성 - 제목과 멘션을 함께 반환
  return `📚 *${group.bookTitle}* (${group.members.length}/${personLimit}명) ${groupStatus}\n${mentions}`;
}
