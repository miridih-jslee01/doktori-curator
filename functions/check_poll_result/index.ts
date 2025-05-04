import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { processPollResult } from "./utils/poll_service.ts";
import { SlackReaction } from "./utils/types.ts";
import { filterBotUsersFromReactions } from "./utils/reaction_processor.ts";
import { safeStringifyBookGroups } from "../_validators/book_group_validator.ts";

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
      book_groups: {
        type: Schema.types.string,
        description: "책 그룹 정보 (JSON 문자열)",
      },
    },
    required: ["result_summary", "book_groups"],
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

      // 2-2. 봇 사용자 필터링
      const filteredReactions = await filterBotUsersFromReactions(
        reactions,
        client,
      );

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

      // 각 그룹의 정보를 저장할 배열
      const groupsInfo = [];

      // 각 그룹의 결과를 채널에 직접 전송
      for (let i = 0; i < filledGroups.length; i++) {
        const group = filledGroups[i];

        // 채널에 직접 전송 (thread_ts 없이)
        const messageResponse = await client.chat.postMessage({
          channel: inputs.channel_id,
          text: messages[i],
          mrkdwn: true,
        });

        // 메시지 전송 성공 시 그룹 정보 저장
        if (messageResponse.ok && messageResponse.ts) {
          groupsInfo.push({
            bookTitle: group.bookTitle,
            members: group.members.join(","), // 멤버 ID 문자열로 변환
            thread_ts: messageResponse.ts, // 스레드 타임스탬프 저장
          });
        }

        // 결과 요약에 추가
        resultSummary += `${group.bookTitle}: ${group.members.length}명\n`;
      }

      // JSON 문자열화 및 유효성 검증
      const stringifyResult = safeStringifyBookGroups(groupsInfo);
      if (!stringifyResult.success || !stringifyResult.data) {
        console.error(`Error: ${stringifyResult.error}`);
        return {
          error: `책 그룹 정보 처리 중 오류 발생: ${
            stringifyResult.error || "데이터가 비어있습니다"
          }`,
        };
      }

      // 7. 투표 요약 정보 반환
      return {
        outputs: {
          result_summary:
            `투표 결과: 총 ${totalParticipants}명 참여, ${filledGroups.length}개 그룹 생성\n${resultSummary}`,
          book_groups: stringifyResult.data,
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
