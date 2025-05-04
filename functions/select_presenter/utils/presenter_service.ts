/**
 * 발제자 선정 관련 비즈니스 로직
 */
import { shuffle } from "../../_utils/arrays.ts";
import { BookGroup } from "../../_types/book_group.ts";

/**
 * 각 그룹에서 발제자를 선정하고 처리 결과를 반환합니다.
 *
 * @param bookGroups 책 그룹 정보 배열
 * @returns 각 그룹별 발제자 정보
 */
export interface PresenterResult {
  bookTitle: string;
  thread_ts: string;
  presenterId: string;
  memberIds: string[];
  selectionMethod: string;
}

export function selectPresenters(bookGroups: BookGroup[]): PresenterResult[] {
  if (bookGroups.length === 0) {
    return [];
  }

  const results: PresenterResult[] = [];

  // 각 그룹에 대해 발제자 선정 처리
  for (const group of bookGroups) {
    const { bookTitle, members, thread_ts } = group;

    // 멤버 목록 파싱
    const memberIds = members.split(",").map((id) => id.trim());

    if (memberIds.length === 0) {
      // 멤버가 없는 경우는 건너뜀
      continue;
    }

    // 발제자 랜덤 선정 (모든 멤버 중에서)
    const presenterId = shuffle(memberIds)[0];
    const selectionMethod = "랜덤으로";

    results.push({
      bookTitle,
      thread_ts,
      presenterId,
      memberIds,
      selectionMethod,
    });
  }

  return results;
}
