/**
 * 투표 독려 관련 유틸리티 함수
 */
import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { chunkArray } from "../../_utils/arrays.ts";
import { EMOJI_MAPPING } from "../../_utils/emoji_mapping.ts";

// 슬랙 리액션 관련 인터페이스
interface SlackReaction {
  name: string;
  users: string[] | undefined;
  count: number;
}

/**
 * 채널 멤버 목록을 가져오고 봇 사용자를 필터링합니다.
 *
 * @param client 슬랙 API 클라이언트
 * @param channelId 채널 ID
 * @returns 봇을 제외한 채널 멤버 ID 배열
 */
export async function getChannelMembers(
  client: SlackAPIClient,
  channelId: string,
): Promise<string[]> {
  const response = await client.conversations.members({
    channel: channelId,
  });

  if (!response.ok || !response.members) {
    throw new Error(
      `채널 멤버 조회 실패: ${response.error || "알 수 없는 오류"}`,
    );
  }

  // 봇 사용자 필터링
  return filterBotUsersFromMembers(response.members, client);
}

/**
 * 멤버 목록에서 봇 사용자를 필터링합니다.
 *
 * @param memberIds 멤버 ID 배열
 * @param client 슬랙 API 클라이언트
 * @returns 봇이 아닌 멤버 ID 배열
 */
export async function filterBotUsersFromMembers(
  memberIds: string[],
  client: SlackAPIClient,
): Promise<string[]> {
  // 한 번에 처리할 최대 사용자 수
  const BATCH_SIZE = 10;

  // 사용자 ID 배열을 청크로 나누기
  const memberChunks = chunkArray(memberIds, BATCH_SIZE);
  const nonBotMembers: string[] = [];

  // 각 청크마다 병렬 처리
  for (const chunk of memberChunks) {
    const chunkPromises = chunk.map(async (memberId) => {
      try {
        const userResponse = await client.users.info({
          user: memberId,
        });

        return {
          userId: memberId,
          isBot: Boolean(userResponse.ok && userResponse.user?.is_bot),
        };
      } catch (error) {
        console.warn(
          `사용자 정보를 가져오는데 실패했습니다 (userId: ${memberId}): ${error}`,
        );
        // 오류 발생 시 기본적으로 봇이 아닌 것으로 처리
        return {
          userId: memberId,
          isBot: false,
        };
      }
    });

    // 현재 청크의 모든 요청 병렬 처리
    const results = await Promise.all(chunkPromises);

    // 봇이 아닌 사용자만 추가
    for (const result of results) {
      if (!result.isBot) {
        nonBotMembers.push(result.userId);
      }
    }
  }

  return nonBotMembers;
}

/**
 * 투표 메시지에 숫자 이모지로 리액션한 사용자 목록을 가져옵니다.
 *
 * @param client 슬랙 API 클라이언트
 * @param channelId 채널 ID
 * @param messageTs 메시지 타임스탬프
 * @returns 숫자 이모지로 투표에 참여한 사용자 ID 배열
 */
export async function getVotedUsers(
  client: SlackAPIClient,
  channelId: string,
  messageTs: string,
): Promise<string[]> {
  const response = await client.reactions.get({
    channel: channelId,
    timestamp: messageTs,
    full: true,
  });

  if (!response.ok || !response.message?.reactions) {
    throw new Error(
      `리액션 정보 조회 실패: ${response.error || "알 수 없는 오류"}`,
    );
  }

  // 숫자 이모지 리액션명 목록
  const numberEmojiNames = EMOJI_MAPPING.map((emoji) => emoji.reaction);

  // 숫자 이모지 리액션에서만 유저 ID 추출하고 중복 제거
  const votedUsers = new Set<string>();
  response.message.reactions.forEach((reaction: SlackReaction) => {
    // 숫자 이모지인 경우에만 처리
    if (reaction.users && numberEmojiNames.includes(reaction.name)) {
      reaction.users.forEach((userId: string) => votedUsers.add(userId));
    }
  });

  return Array.from(votedUsers);
}

/**
 * 투표 독려 메시지를 생성합니다.
 *
 * @param nonVoters 투표하지 않은 사용자 ID 배열
 * @returns 포맷팅된 독려 메시지
 */
export function createEncouragementMessage(
  nonVoters: string[],
): string {
  const mentions = nonVoters.map((userId) => `<@${userId}>`).join(" ");

  return `
아직 투표에 참여하지 않으신 분들 멘션 드립니다!
${mentions}
`;
}
