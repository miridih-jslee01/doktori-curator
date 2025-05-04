import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { shuffle } from "../utils/arrays.ts";
import { safeParseBookGroups } from "../utils/validators.ts";

export const SelectPresenterFunction = DefineFunction({
  callback_id: "select_presenter",
  title: "발제자 겸 진행자 선정",
  description: "그룹 내에서 발제자 겸 진행자를 선정합니다",
  source_file: "functions/select_presenter/index.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.types.string,
        description: "채널 ID",
      },
      book_groups: {
        type: Schema.types.string,
        description: "책 그룹 정보 배열 (JSON 문자열)",
      },
    },
    required: ["channel_id", "book_groups"],
  },
  output_parameters: {
    properties: {
      result_summary: {
        type: Schema.types.string,
        description: "발제자 선정 결과 요약",
      },
    },
    required: ["result_summary"],
  },
});

export default SlackFunction(
  SelectPresenterFunction,
  async ({ inputs, client }) => {
    try {
      // 책 그룹 정보 안전하게 파싱
      const parseResult = safeParseBookGroups(inputs.book_groups);
      console.log("Parse result:", parseResult);

      if (!parseResult.success || !parseResult.data) {
        return {
          error: `책 그룹 정보 파싱 실패: ${
            parseResult.error || "데이터가 비어있습니다"
          }`,
        };
      }

      const bookGroups = parseResult.data;

      if (bookGroups.length === 0) {
        return {
          error: "처리할 책 그룹 정보가 없습니다.",
        };
      }

      let resultSummary = "📚 *발제자 선정 결과*\n";

      // 각 그룹에 대해 발제자 선정 처리
      for (const group of bookGroups) {
        const { bookTitle, members, thread_ts } = group;

        // 멤버 목록 파싱
        const memberIds = members.split(",").map((id) => id.trim());

        if (memberIds.length === 0) {
          resultSummary +=
            `[${bookTitle}] 멤버가 없어 발제자를 선정할 수 없습니다.\n`;
          continue;
        }

        // 발제자 랜덤 선정 (모든 멤버 중에서)
        const presenterId = shuffle(memberIds)[0];
        const selectionMethod = "랜덤으로";

        // 그룹별 결과 메시지 생성
        const resultMessage =
          `📚 *[${bookTitle}] 발제자 선정 결과*\n<@${presenterId}>님이 ${selectionMethod} 발제자 겸 진행자로 선정되었습니다! 🎉\n\n다른 분이 발제자를 맡고 싶으시면 이 메시지에 :o: 이모지로 반응해주세요.`;

        // 선정 결과를 스레드에 게시
        await client.chat.postMessage({
          channel: inputs.channel_id,
          thread_ts: thread_ts,
          text: resultMessage,
          mrkdwn: true,
        });
        console.log(
          {
            channel: inputs.channel_id,
            thread_ts: thread_ts,
            text: resultMessage,
            mrkdwn: true,
          },
        );

        // 결과 요약에 추가
        resultSummary +=
          `[${bookTitle}] <@${presenterId}> (${selectionMethod})\n`;
      }

      // 결과 반환
      return {
        outputs: {
          result_summary: resultSummary,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error: ${errorMessage}`);
      return {
        error: `발제자 선정 중 오류 발생: ${errorMessage}`,
      };
    }
  },
);
