import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { processPollResult } from "./utils/poll_service.ts";
import { SlackReaction } from "./utils/types.ts";

export const CheckPollResultFunction = DefineFunction({
  callback_id: "check_poll_result",
  title: "도서 투표 결과 확인 및 그룹 구성",
  description: "도서 투표 결과를 확인하고 인원제한에 맞게 그룹을 구성합니다",
  source_file: "functions/check_poll_result/index.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.types.string,
        description: "메시지가 있는 채널 ID (CreatePollFunction 출력값 사용)",
      },
      message_ts: {
        type: Schema.types.string,
        description:
          "투표 메시지의 타임스탬프 (CreatePollFunction 출력값 사용)",
      },
      person_limit: {
        type: Schema.types.number,
        description: "그룹당 인원 제한 수 (CreatePollFunction 출력값 사용)",
      },
      poll_items: {
        type: Schema.types.string,
        description: "원본 투표 항목들 (CreatePollFunction 출력값 사용)",
      },
    },
    required: ["channel_id", "message_ts", "person_limit", "poll_items"],
  },
  output_parameters: {
    properties: {
      result_summary: {
        type: Schema.types.string,
        description: "투표 결과 요약",
      },
    },
    required: ["result_summary"],
  },
});

export default SlackFunction(
  CheckPollResultFunction,
  async ({ inputs, client }) => {
    try {
      // 1. 투표 항목(책) 파싱
      const bookTitles = inputs.poll_items
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);

      // 2. 메시지의 리액션 정보 가져오기
      const reactionsResponse = await client.reactions.get({
        channel: inputs.channel_id,
        timestamp: inputs.message_ts,
        full: true,
      });

      if (!reactionsResponse.ok || !reactionsResponse.message?.reactions) {
        return {
          error: "리액션 정보를 가져오는데 실패했습니다: " +
            (reactionsResponse.error || "알 수 없는 오류"),
        };
      }

      // 2-1. 모든 반응 가져오기
      const reactions = reactionsResponse.message.reactions as SlackReaction[];

      // 2-2. 사용자 ID가 봇인지 확인하기 위한 맵 생성
      const userBotMap = new Map<string, boolean>();

      // 모든 반응에서 사용자 ID 추출
      const allUserIds = new Set<string>();
      for (const reaction of reactions) {
        for (const userId of reaction.users) {
          allUserIds.add(userId);
        }
      }

      // 각 사용자 ID에 대해 users.info API 호출하여 봇 여부 확인
      for (const userId of allUserIds) {
        try {
          const userResponse = await client.users.info({
            user: userId,
          });

          // 사용자 ID와 봇 여부를 맵에 저장
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

      // 2-3. 각 반응의 사용자 배열에서 봇 사용자 필터링
      const filteredReactions = reactions.map((reaction) => {
        return {
          ...reaction,
          users: reaction.users.filter((userId) => !userBotMap.get(userId)),
          // count 업데이트 (필터링 후 남은 사용자 수로)
          count: reaction.users.filter((userId) =>
            !userBotMap.get(userId)
          ).length,
        };
      });

      // 3. 투표 결과 처리 - 봇이 필터링된 reactions 배열 전달
      const { groups: bookGroups, messages } = processPollResult(
        filteredReactions,
        bookTitles,
        inputs.person_limit,
      );

      // 결과가 없으면 오류 반환
      if (bookGroups.length === 0) {
        return {
          error: "투표에 참여한 사용자가 없습니다.",
        };
      }

      // 책 인덱스 순서대로 정렬 (1, 2, 3, 4 순서로 표시)
      const filledGroups = bookGroups.filter((group) =>
        group.members.length > 0
      );
      filledGroups.sort((a, b) => a.bookIndex - b.bookIndex);

      // 총 참여 인원수 계산
      const totalParticipants = filledGroups.reduce(
        (sum, group) => sum + group.members.length,
        0,
      );

      let resultSummary = "";

      // 먼저 결과 요약 메시지를 보냄
      const summaryText =
        `📊 *도서 투표 결과*\n총 ${totalParticipants}명이 참여했습니다. ${filledGroups.length}개 그룹이 생성되었습니다.`;

      await client.chat.postMessage({
        channel: inputs.channel_id,
        text: summaryText,
        mrkdwn: true,
      });

      // 각 그룹의 결과를 채널에 직접 전송
      for (let i = 0; i < filledGroups.length; i++) {
        const group = filledGroups[i];

        // 채널에 직접 전송 (thread_ts 없이)
        await client.chat.postMessage({
          channel: inputs.channel_id,
          text: messages[i],
          mrkdwn: true,
        });

        // 결과 요약에 추가
        resultSummary += `${group.bookTitle}: ${group.members.length}명\n`;
      }

      // 7. 투표 요약 정보 반환
      return {
        outputs: {
          result_summary:
            `투표 결과: 총 ${totalParticipants}명 참여, ${filledGroups.length}개 그룹 생성\n${resultSummary}`,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error: ${errorMessage}`);
      return {
        error: `투표 결과 처리 중 오류 발생: ${errorMessage}`,
      };
    }
  },
);
