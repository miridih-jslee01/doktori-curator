import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { safeParseBookGroups } from "../_validators/book_group_validator.ts";
import {
  MessageReactions,
  selectPresenters,
} from "./utils/presenter_service.ts";
import { formatGroupResultMessage } from "./utils/message_formatter.ts";

// Slack 리액션 타입 정의
interface SlackReaction {
  name: string;
  users: string[];
  count: number;
}

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
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  SelectPresenterFunction,
  async ({ inputs, client }) => {
    try {
      // 1. 책 그룹 정보 안전하게 파싱
      const parseResult = safeParseBookGroups(inputs.book_groups);

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

      // 2. 각 발제자 모집 메시지에 대한 리액션 정보 수집
      const messageReactions: MessageReactions = {};

      // 발제자 메시지 타임스탬프가 있는 그룹만 처리
      const presenterMessagePromises = bookGroups
        .filter((group) => group.presenter_message_ts)
        .map(async (group) => {
          if (!group.presenter_message_ts) return; // TypeScript를 위한 타입 가드

          try {
            // 메시지의 리액션 정보 가져오기
            const reactionsResponse = await client.reactions.get({
              channel: inputs.channel_id,
              timestamp: group.presenter_message_ts,
              full: true,
            });

            if (reactionsResponse.ok && reactionsResponse.message?.reactions) {
              // 'o' 리액션이 있는지 확인
              const oReaction = reactionsResponse.message.reactions.find(
                (reaction: SlackReaction) => reaction.name === "o",
              );

              if (oReaction && oReaction.users) {
                // 'o' 리액션을 한 사용자 목록 저장
                messageReactions[group.presenter_message_ts] = oReaction.users;
              }
            }
          } catch (error) {
            console.error(`리액션 정보 가져오기 실패: ${error}`);
            // 오류가 발생해도 다른 그룹 처리 계속
          }
        });

      // 모든 리액션 정보 가져오기 완료 대기
      await Promise.all(presenterMessagePromises);

      // 3. 발제자 선정 (비즈니스 로직 분리) - 리액션 정보 전달
      const presenterResults = selectPresenters(bookGroups, messageReactions);

      // 4. 결과 메시지 생성 및 전송
      const messagePromises = presenterResults.map((result) => {
        const message = formatGroupResultMessage(result, result.isVolunteer);

        return client.chat.postMessage({
          channel: inputs.channel_id,
          thread_ts: result.thread_ts,
          text: message,
          mrkdwn: true,
        });
      });

      // 5. 모든 메시지 전송을 병렬로 처리
      await Promise.all(messagePromises);

      // 6. 결과 반환
      return {
        outputs: {},
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
