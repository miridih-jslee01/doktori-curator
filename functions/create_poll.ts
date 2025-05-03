import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const CreatePollFunction = DefineFunction({
  callback_id: "create_poll",
  title: "도서 투표 생성",
  description: "줄바꿈으로 구분된 도서 목록으로 숫자 이모지 투표를 생성합니다",
  source_file: "functions/create_poll.ts",
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
    },
    required: ["channel_id", "poll_items"],
  },
  output_parameters: {
    properties: {
      channel_id: { type: Schema.types.string },
      message_ts: { type: Schema.types.string },
    },
    required: ["channel_id", "message_ts"],
  },
});

export default SlackFunction(
  CreatePollFunction,
  async ({ inputs, client }) => {
    // 1) poll_items 파싱
    const items = inputs.poll_items
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);
    console.log(items);

    // 항목이 10개를 초과하면 오류 반환
    if (items.length > 10) {
      return {
        error: "투표 도서는 최대 10권까지만 지원합니다.",
      };
    }

    // 2) 숫자 이모지 배열
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    console.log(emojis);

    // 3) 메시지 텍스트 조합
    const itemsWithEmojis = items
      .map((item, idx) => `${emojis[idx]}  ${item}`)
      .join("\n");
    console.log(itemsWithEmojis);

    // 내일 현재 시간 계산
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 시간 포맷팅 (한국어 형식)
    const formattedDate = tomorrow.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const text = `<!channel> 
    ${itemsWithEmojis}
    
    투표 참여 방법
    1. 원하는 도서 이모지를 누르세요.
    2. 인원제한을 넘어가면 랜덤으로 다른 도서를 추천해드립니다.
    3. 투표마감은 *${formattedDate}* 입니다!
    `;

    // 4) 메시지 전송 부분 전에 추가
    console.log(`채널 ID: ${inputs.channel_id}`);

    // channel_id가 비어있거나 형식이 잘못된 경우 처리
    if (!inputs.channel_id || inputs.channel_id.trim() === "") {
      return {
        error:
          "유효한 채널 ID가 제공되지 않았습니다. 워크플로우 설정을 확인하세요.",
      };
    }

    // 5) 메시지 전송
    try {
      const post = await client.chat.postMessage({
        channel: inputs.channel_id,
        text,
        mrkdwn: true,
      });
      console.log(post);
      // 6) 각 이모지로 리액션 추가
      for (let i = 0; i < items.length; i++) {
        // 숫자에 맞는 이모지 코드 사용
        const emojiName = [
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
          "keycap_ten",
        ][i];

        try {
          await client.reactions.add({
            channel: post.channel!,
            timestamp: post.ts!,
            name: emojiName,
          });
          console.log(`${emojiName} 리액션 추가 성공`);
        } catch (error) {
          console.log(`${emojiName} 리액션 추가 실패: ${error}`);
        }
      }
      console.log("리액션 추가 완료");

      // 7) 워크플로우에 반환할 output 값
      return {
        outputs: {
          channel_id: post.channel!,
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
