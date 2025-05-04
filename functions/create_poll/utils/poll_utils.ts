import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { EMOJI_MAPPING } from "../../utils/emoji_mapping.ts";

// 투표 항목 파싱 및 검증
export function parseAndValidatePollItems(
  pollItemsStr: string,
): { items: string[] } | { error: string } {
  const items = pollItemsStr
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean);

  // 항목이 10개를 초과하면 오류 반환
  if (items.length > 10) {
    return {
      error: "투표 도서는 최대 10권까지만 지원합니다.",
    };
  }

  return { items };
}

// 내일 현재 시간 계산하여 포맷팅
export function getTomorrowFormattedDate(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// 투표 메시지 텍스트 생성
export function createPollMessageText(
  items: string[],
  personLimit: number = 0,
): string {
  const itemsWithEmojis = items
    .map((item, idx) => `${EMOJI_MAPPING[idx].display}  ${item}`)
    .join("\n");

  const formattedDate = getTomorrowFormattedDate();

  return `<!channel>\n${itemsWithEmojis}
    
  📌 *투표 참여 방법*
  1. 👆 원하는 도서 *이모지를 눌러* 투표하세요.
  2. 🔄 그룹당 인원은 *${personLimit}명* 으로 제한됩니다. 초과 시 투표 마감시 다른 그룹으로 자동 배정됩니다.
  3. ⏰ 투표마감은 *${formattedDate}* 입니다!
  `;
}

// 메시지에 리액션 추가
export async function addReactionsToMessage(
  client: SlackAPIClient,
  channel: string,
  timestamp: string,
  itemsCount: number,
): Promise<void> {
  for (let i = 0; i < itemsCount; i++) {
    try {
      await client.reactions.add({
        channel: channel,
        timestamp: timestamp,
        name: EMOJI_MAPPING[i].reaction,
      });
      console.log(`${EMOJI_MAPPING[i].reaction} 리액션 추가 성공`);
    } catch (error) {
      console.log(`${EMOJI_MAPPING[i].reaction} 리액션 추가 실패: ${error}`);
    }
  }
  console.log("리액션 추가 완료");
}
