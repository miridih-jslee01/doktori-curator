import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  assignUsersToGroups,
  createGroupStatusMessage,
  extractUsersFromReactions,
  ReactionUser,
  reassignUnassignedUsers,
} from "./utils/poll_result_utils.ts";

export const CheckPollResultFunction = DefineFunction({
  callback_id: "check_poll_result",
  title: "도서 투표 결과 확인 및 그룹 구성",
  description: "도서 투표 결과를 확인하고 인원제한에 맞게 그룹을 구성합니다",
  source_file: "functions/check_poll_result.ts",
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

      // 3. 사용자 리액션 정보 수집 및 가공
      const allUsers: ReactionUser[] = extractUsersFromReactions(
        reactionsResponse.message.reactions,
        bookTitles,
      );

      // 사용자가 없으면 오류 반환
      if (allUsers.length === 0) {
        return {
          error: "투표에 참여한 사용자가 없습니다.",
        };
      }

      // 4. 책별로 사용자 그룹화 및 인원제한 처리
      const { bookGroups, unassignedUsers } = assignUsersToGroups(
        allUsers,
        bookTitles,
        inputs.person_limit,
      );

      // 5. 미할당 사용자를 다른 그룹으로 재배치
      reassignUnassignedUsers(bookGroups, unassignedUsers, inputs.person_limit);

      // 6. 최종 결과를 채널에 직접 메시지로 보냄
      const filledGroups = bookGroups.filter((group) =>
        group.members.length > 0
      );

      // 책 인덱스 순서대로 정렬 (1, 2, 3, 4 순서로 표시)
      filledGroups.sort((a, b) => a.bookIndex - b.bookIndex);

      let resultSummary = "";

      // 먼저 결과 요약 메시지를 보냄
      const summaryText =
        `📊 *도서 투표 결과*\n총 ${allUsers.length}명이 참여했습니다. ${filledGroups.length}개 그룹이 생성되었습니다.`;

      await client.chat.postMessage({
        channel: inputs.channel_id,
        text: summaryText,
        mrkdwn: true,
      });

      // 각 그룹의 결과를 채널에 직접 전송
      for (const group of filledGroups) {
        // 그룹 메시지 생성
        const groupMessage = createGroupStatusMessage(
          group,
          inputs.person_limit,
        );

        // 채널에 직접 전송 (thread_ts 없이)
        await client.chat.postMessage({
          channel: inputs.channel_id,
          text: groupMessage,
          mrkdwn: true,
        });

        // 결과 요약에 추가
        resultSummary += `${group.bookTitle}: ${group.members.length}명\n`;
      }

      // 7. 투표 요약 정보 반환
      return {
        outputs: {
          result_summary:
            `투표 결과: 총 ${allUsers.length}명 참여, ${filledGroups.length}개 그룹 생성\n${resultSummary}`,
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
