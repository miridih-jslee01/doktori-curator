import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  createEncouragementMessage,
  getChannelMembers,
  getVotedUsers,
} from "./utils/poll_utils.ts";

export const EncouragePollFunction = DefineFunction({
  callback_id: "encourage_poll",
  title: "투표 참여 독려",
  description: "투표에 참여하지 않은 채널 멤버들에게 투표를 독려합니다",
  source_file: "functions/encourage_poll/index.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.types.string,
        description: "투표가 진행 중인 채널 ID",
      },
      message_ts: {
        type: Schema.types.string,
        description: "투표 메시지의 타임스탬프",
      },
    },
    required: ["channel_id", "message_ts"],
  },
  output_parameters: {
    properties: {
      non_voters_count: {
        type: Schema.types.number,
        description: "투표에 참여하지 않은 인원 수",
      },
    },
    required: ["non_voters_count"],
  },
});

export default SlackFunction(
  EncouragePollFunction,
  async ({ inputs, client }) => {
    try {
      // 1. 채널 멤버 목록 가져오기 (봇 제외)
      const channelMembers = await getChannelMembers(client, inputs.channel_id);

      // 2. 투표에 참여한 사용자 목록 가져오기
      const votedUsers = await getVotedUsers(
        client,
        inputs.channel_id,
        inputs.message_ts,
      );

      // 3. 투표하지 않은 사용자 목록 생성
      const nonVoters = channelMembers.filter(
        (userId) => !votedUsers.includes(userId),
      );

      // 4. 투표하지 않은 사용자가 있다면 메시지 전송
      if (nonVoters.length > 0) {
        const message = createEncouragementMessage(
          nonVoters,
        );

        await client.chat.postMessage({
          channel: inputs.channel_id,
          thread_ts: inputs.message_ts,
          text: message,
          mrkdwn: true,
        });

        console.log(
          `${nonVoters.length}명의 사용자에게 투표 독려 메시지를 전송했습니다.`,
        );
      } else {
        console.log("모든 채널 멤버가 이미 투표에 참여했습니다!");
      }

      // 5. 결과 반환
      return {
        outputs: {
          non_voters_count: nonVoters.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error: ${errorMessage}`);
      return {
        error: `투표 독려 중 오류 발생: ${errorMessage}`,
      };
    }
  },
);
