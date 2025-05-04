import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { safeParseBookGroups } from "../_validators/book_group_validator.ts";
import { selectPresenters } from "./utils/presenter_service.ts";
import {
  formatGroupResultMessage,
  formatSummaryMessage,
} from "./utils/message_formatter.ts";

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
      // 1. 책 그룹 정보 안전하게 파싱
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

      // 2. 빈 그룹과 유효한 그룹 분리
      const emptyGroupTitles = bookGroups
        .filter((group) => !group.members || group.members.trim() === "")
        .map((group) => group.bookTitle);

      // 3. 발제자 선정 (비즈니스 로직 분리)
      const presenterResults = selectPresenters(bookGroups);

      // 4. 결과 메시지 생성 및 전송
      const messagePromises = presenterResults.map((result) => {
        const message = formatGroupResultMessage(result);

        return client.chat.postMessage({
          channel: inputs.channel_id,
          thread_ts: result.thread_ts,
          text: message,
          mrkdwn: true,
        });
      });

      // 5. 모든 메시지 전송을 병렬로 처리
      await Promise.all(messagePromises);

      // 6. 결과 요약 생성
      const resultSummary = formatSummaryMessage(
        presenterResults,
        emptyGroupTitles,
      );

      // 7. 결과 반환
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
