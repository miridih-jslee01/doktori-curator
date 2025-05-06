/**
 * 투표 결과 처리의 메인 로직을 담당하는 모듈
 */
import { BookGroup, SlackReaction } from "./types.ts";
import { extractUsersFromReactions } from "./reaction_processor.ts";
import {
  assignUsersToGroups,
  reassignUnassignedUsers,
} from "./group_assignment.ts";
import { createGroupStatusMessage } from "./message_formatter.ts";

/**
 * 투표 결과를 처리하여 그룹을 구성하고 메시지를 생성합니다.
 *
 * @param reactions 슬랙 리액션 배열
 * @param bookTitles 투표에 포함된 책 제목 배열
 * @param personLimit 그룹당 인원 제한
 * @returns 구성된 그룹과 그룹별 상태 메시지
 */
export function processPollResult(
  reactions: SlackReaction[],
  bookTitles: string[],
  personMaxLimit: number,
  personMinLimit: number,
): { groups: BookGroup[]; messages: string[] } {
  // 1. 사용자 추출 (봇은 이미 필터링됨)
  const allUsers = extractUsersFromReactions(reactions, bookTitles);

  if (allUsers.length === 0) {
    return { groups: [], messages: ["아직 투표한 사람이 없습니다."] };
  }

  // 2. 그룹 할당
  const { bookGroups, unassignedUsers } = assignUsersToGroups(
    allUsers,
    bookTitles,
    personMaxLimit,
  );

  // 3. 미할당 사용자 재배치
  reassignUnassignedUsers(bookGroups, unassignedUsers, personMaxLimit);

  // 4. 그룹별 메시지 생성
  const messages = bookGroups.map((group) =>
    createGroupStatusMessage(group, personMaxLimit)
  );

  return {
    groups: bookGroups,
    messages,
  };
}
