/**
 * 발제자 선정 관련 비즈니스 로직
 */
import { shuffle } from "../../_utils/arrays.ts";
import { BookGroup } from "../../_types/book_group.ts";

/**
 * 각 그룹에서 발제자를 선정하고 처리 결과를 반환합니다.
 *
 * @param bookGroups 책 그룹 정보 배열
 * @param reactions 각 메시지에 대한 리액션 정보 (메시지 ID를 키로 사용)
 * @returns 각 그룹별 발제자 정보
 */
export interface PresenterResult {
  bookTitle: string;
  thread_ts: string;
  presenterId: string;
  memberIds: string[];
  isVolunteer: boolean; // 자원자 여부
}

export interface MessageReactions {
  [message_ts: string]: string[]; // 메시지 ID를 키로, 리액션을 단 사용자 ID 배열을 값으로 사용
}

export function selectPresenters(
  bookGroups: BookGroup[],
  messageReactions: MessageReactions = {},
): PresenterResult[] {
  if (bookGroups.length === 0) {
    return [];
  }

  const results: PresenterResult[] = [];

  // 각 그룹에 대해 발제자 선정 처리
  for (const group of bookGroups) {
    const { bookTitle, members, thread_ts, presenter_message_ts } = group;

    // 멤버 목록 파싱
    const memberIds = members.split(",").map((id) => id.trim());

    if (memberIds.length === 0) {
      // 멤버가 없는 경우는 건너뜀
      continue;
    }

    let presenterId: string;
    let isVolunteer = false; // 기본값은 false (랜덤 선정)

    // 발제자 메시지에 리액션을 달았는지 확인
    if (presenter_message_ts && messageReactions[presenter_message_ts]) {
      const reactedUsers = messageReactions[presenter_message_ts];

      // 리액션을 단 사용자 중에서 그룹 멤버인 사용자만 필터링
      const volunteers = reactedUsers.filter(
        (userId) => memberIds.includes(userId),
      );

      if (volunteers.length > 0) {
        // 지원자가 있으면 지원자 중에서 랜덤으로 선정
        presenterId = shuffle(volunteers)[0];
        isVolunteer = true; // 자원자로 설정
      } else {
        // 지원자가 없으면 모든 멤버 중에서 랜덤으로 선정
        presenterId = shuffle(memberIds)[0];
      }
    } else {
      // 발제자 메시지 정보가 없거나 리액션이 없으면 랜덤 선정
      presenterId = shuffle(memberIds)[0];
    }

    results.push({
      bookTitle,
      thread_ts,
      presenterId,
      memberIds,
      isVolunteer,
    });
  }

  return results;
}
