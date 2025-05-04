/**
 * 투표 반응에서 사용자 정보를 추출하는 모듈
 */
import { ReactionUser, SlackReaction } from "./types.ts";
import { EMOJI_MAPPING } from "../utils/emoji_mapping.ts";

/**
 * 리액션 데이터로부터 사용자 정보를 추출합니다.
 */
export function extractUsersFromReactions(
  reactions: SlackReaction[],
  bookTitles: string[],
): ReactionUser[] {
  const allUsers: ReactionUser[] = [];

  // 각 리액션 이모지에 대해 (숫자 이모지만 필터링)
  for (let bookIndex = 0; bookIndex < EMOJI_MAPPING.length; bookIndex++) {
    const emojiInfo = EMOJI_MAPPING[bookIndex];
    const reaction = reactions.find((r) => r.name === emojiInfo.reaction);

    // 해당 이모지에 반응한 사용자가 있다면
    if (reaction?.users && bookIndex < bookTitles.length) {
      // 각 사용자를 배열에 추가
      for (const userId of reaction.users) {
        allUsers.push({
          bookIndex,
          userId,
          bookTitle: bookTitles[bookIndex],
        });
      }
    }
  }

  return allUsers;
}
