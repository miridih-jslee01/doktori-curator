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
  const { bookTitle, presenterId, selectionMethod } = result;

  return `📚 *${bookTitle} 발제자 선정 결과*\n<@${presenterId}>님이 ${selectionMethod} 발제자 겸 진행자로 선정되었습니다! 🎉`;
}

/**
 * 전체 결과에 대한 요약 메시지를 생성합니다.
 *
 * @param results 모든 그룹의 발제자 선정 결과
 * @param emptyGroupTitles 멤버가 없어 발제자를 선정할 수 없는 그룹 제목 목록
 * @returns 포맷팅된 요약 메시지
 */
export function formatSummaryMessage(
  results: PresenterResult[],
  emptyGroupTitles: string[] = [],
): string {
  let summaryMessage = "📚 *발제자 선정 결과*\n";

  // 발제자가 선정된 그룹 정보 추가
  for (const result of results) {
    const { bookTitle, presenterId, selectionMethod } = result;
    summaryMessage += `[${bookTitle}] <@${presenterId}> (${selectionMethod})\n`;
  }

  // 발제자를 선정할 수 없는 그룹 정보 추가
  for (const title of emptyGroupTitles) {
    summaryMessage += `[${title}] 멤버가 없어 발제자를 선정할 수 없습니다.\n`;
  }

  return summaryMessage;
}
