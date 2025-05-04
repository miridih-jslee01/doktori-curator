/**
 * 투표 반응에서 사용자 정보를 추출하는 모듈
 */
import { ReactionUser, SlackReaction } from "./types.ts";
import { EMOJI_MAPPING } from "../../utils/emoji_mapping.ts";

/**
 * 리액션 데이터로부터 사용자 정보를 추출합니다.
 *
 * @param reactions 슬랙 리액션 배열
 * @param bookTitles 투표에 포함된 책 제목 배열
 * @param botUserIds 제외할 봇 사용자 ID 배열 (선택적)
 * @returns 사용자 정보 배열
 */
export function extractUsersFromReactions(
  reactions: SlackReaction[],
  bookTitles: string[],
  botUserIds: string[] = [],
): ReactionUser[] {
  const allUsers: ReactionUser[] = [];

  // 각 리액션 이모지에 대해 (숫자 이모지만 필터링)
  for (let bookIndex = 0; bookIndex < EMOJI_MAPPING.length; bookIndex++) {
    const emojiInfo = EMOJI_MAPPING[bookIndex];
    const reaction = reactions.find((r) => r.name === emojiInfo.reaction);

    // 해당 이모지에 반응한 사용자가 있다면
    if (reaction?.users && bookIndex < bookTitles.length) {
      // 각 사용자를 배열에 추가 (봇 사용자 제외)
      for (const userId of reaction.users) {
        // 봇 사용자 ID 목록에 포함되지 않은 사용자만 추가
        if (!botUserIds.includes(userId)) {
          allUsers.push({
            bookIndex,
            userId,
            bookTitle: bookTitles[bookIndex],
          });
        }
      }
    }
  }

  return allUsers;
}
