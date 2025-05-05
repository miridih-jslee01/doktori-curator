/**
 * 발제자 선정 관련 메시지 포맷팅
 */
import { PresenterResult } from "./presenter_service.ts";

/**
 * 특정 그룹에 대한 결과 메시지를 생성합니다.
 *
 * @param result 발제자 선정 결과
 * @returns 포맷팅된 메시지
 */
export function formatGroupResultMessage(result: PresenterResult): string {
  const { bookTitle, presenterId } = result;

  return `📚 *${bookTitle} 발제자 선정 결과*\n<@${presenterId}>님이 발제자 겸 진행자로 선정되었습니다! 🎉`;
}
