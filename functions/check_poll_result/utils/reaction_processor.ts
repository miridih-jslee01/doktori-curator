/**
 * 투표 반응 처리 모듈 - 사용자 필터링 및 데이터 추출 관련 기능
 */
import { ReactionUser, SlackReaction } from "./types.ts";
import { EMOJI_MAPPING } from "../../utils/emoji_mapping.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

// ===== 봇 필터링 관련 기능 =====

/**
 * 반응에서 사용자 ID를 추출합니다.
 *
 * @param reactions 슬랙 리액션 배열
 * @returns 고유한 사용자 ID 세트
 */
function extractUniqueUserIds(reactions: SlackReaction[]): Set<string> {
  const userIds = new Set<string>();
  for (const reaction of reactions) {
    for (const userId of reaction.users) {
      userIds.add(userId);
    }
  }
  return userIds;
}

/**
 * 사용자 ID가 봇인지 확인하기 위한 맵을 생성합니다.
 *
 * @param userIds 사용자 ID 세트
 * @param client 슬랙 API 클라이언트
 * @returns 사용자 ID와 봇 여부를 매핑한 맵
 */
async function createUserBotMap(
  userIds: Set<string>,
  client: SlackAPIClient,
): Promise<Map<string, boolean>> {
  const userBotMap = new Map<string, boolean>();

  for (const userId of userIds) {
    try {
      const userResponse = await client.users.info({
        user: userId,
      });

      userBotMap.set(
        userId,
        Boolean(userResponse.ok && userResponse.user?.is_bot),
      );
    } catch (error) {
      console.warn(
        `사용자 정보를 가져오는데 실패했습니다 (userId: ${userId}): ${error}`,
      );
      // 오류 발생 시 기본적으로 봇이 아닌 것으로 처리
      userBotMap.set(userId, false);
    }
  }

  return userBotMap;
}

/**
 * 반응 목록에서 봇 사용자를 필터링합니다.
 *
 * @param reactions 슬랙 리액션 배열
 * @param userBotMap 사용자 ID와 봇 여부를 매핑한 맵
 * @returns 봇 사용자가 필터링된 리액션 배열
 */
function filterBotUsers(
  reactions: SlackReaction[],
  userBotMap: Map<string, boolean>,
): SlackReaction[] {
  return reactions.map((reaction) => {
    const filteredUsers = reaction.users.filter((userId) =>
      !userBotMap.get(userId)
    );

    return {
      ...reaction,
      users: filteredUsers,
      count: filteredUsers.length,
    };
  });
}

/**
 * 반응 목록에서 봇 사용자를 식별하고 필터링합니다.
 *
 * @param reactions 슬랙 리액션 배열
 * @param client 슬랙 API 클라이언트
 * @returns 봇 사용자가 필터링된 리액션 배열
 */
export async function filterBotUsersFromReactions(
  reactions: SlackReaction[],
  client: SlackAPIClient,
): Promise<SlackReaction[]> {
  // 1. 고유한 사용자 ID 세트 추출
  const userIds = extractUniqueUserIds(reactions);

  // 2. 사용자 ID와 봇 여부 매핑 생성
  const userBotMap = await createUserBotMap(userIds, client);

  // 3. 봇 사용자 필터링
  return filterBotUsers(reactions, userBotMap);
}

// ===== 투표 정보 추출 관련 기능 =====

/**
 * 리액션 데이터로부터 사용자 투표 정보를 추출합니다.
 *
 * @param reactions 슬랙 리액션 배열
 * @param bookTitles 투표에 포함된 책 제목 배열
 * @returns 사용자 투표 정보 배열
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
