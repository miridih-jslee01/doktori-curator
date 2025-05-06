import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  addReactionsToMessage,
  createPollMessageText,
  parseAndValidatePollItems,
} from "./utils/poll_utils.ts";

export const CreatePollFunction = DefineFunction({
  callback_id: "create_poll",
  title: "도서 투표 생성",
  description: "줄바꿈으로 구분된 도서 목록으로 숫자 이모지 투표를 생성합니다",
  source_file: "functions/create_poll/index.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.types.string,
        description: "메시지를 보낼 채널 ID",
      },
      poll_items: {
        type: Schema.types.string,
        description: "줄바꿈(\\n)으로 구분된 도서 목록",
      },
      person_min_limit: {
        type: Schema.types.number,
        description: "그룹당 인원 최소 제한 수",
      },
      person_max_limit: {
        type: Schema.types.number,
        description: "그룹당 인원 최대 제한 수",
      },
      deadline_days: {
        type: Schema.types.number,
        description: "투표 마감까지 일수",
        default: 1,
      },
    },
    required: [
      "channel_id",
      "poll_items",
      "person_min_limit",
      "person_max_limit",
    ],
  },
  output_parameters: {
    properties: {
      message_ts: { type: Schema.types.string },
    },
    required: ["message_ts"],
  },
});

export default SlackFunction(
  CreatePollFunction,
  async ({ inputs, client }) => {
    // 1) 투표 항목 파싱 및 검증
    const parsedItems = parseAndValidatePollItems(inputs.poll_items);
    if ("error" in parsedItems) {
      return { error: parsedItems.error };
    }

    const { items } = parsedItems;

    const personMaxLimit = inputs.person_max_limit || 0;
    const personMinLimit = inputs.person_min_limit || 0;
    const deadlineDays = inputs.deadline_days || 1;

    // 2) 메시지 텍스트 생성 (인원 제한 정보 포함)
    const text = createPollMessageText(
      items,
      personMaxLimit,
      deadlineDays,
      personMinLimit,
    );

    // 3) 채널 ID 검증
    console.log(`채널 ID: ${inputs.channel_id}`);
    if (!inputs.channel_id || inputs.channel_id.trim() === "") {
      return {
        error:
          "유효한 채널 ID가 제공되지 않았습니다. 워크플로우 설정을 확인하세요.",
      };
    }

    // 4) 메시지 전송 및 리액션 추가
    try {
      const post = await client.chat.postMessage({
        channel: inputs.channel_id,
        text,
        mrkdwn: true,
      });

      // 5) 리액션 추가
      await addReactionsToMessage(
        client,
        post.channel!,
        post.ts!,
        items.length,
      );

      // 6) 워크플로우에 반환할 output 값
      return {
        outputs: {
          message_ts: post.ts!,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.log(errorMessage);
      return {
        error: `메시지 전송 중 오류가 발생했습니다: ${errorMessage}`,
      };
    }
  },
);
