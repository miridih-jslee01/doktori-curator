import { EMOJI_MAPPING } from "./emoji_mapping.ts";

// 리액션 정보를 가진 사용자를 위한 타입 정의
export interface ReactionUser {
  bookIndex: number; // 책 인덱스 (0부터 시작)
  userId: string; // 사용자 ID
  bookTitle: string; // 책 제목
}

// 최종 구성된 그룹 정보를 위한 타입 정의
export interface BookGroup {
  bookIndex: number; // 책 인덱스
  bookTitle: string; // 책 제목
  members: string[]; // 멤버 ID 목록
  isFull: boolean; // 인원제한 충족 여부
}

// 리액션 데이터로부터 사용자 정보 추출
export function extractUsersFromReactions(
  reactions: any[],
  bookTitles: string[],
): ReactionUser[] {
  const allUsers: ReactionUser[] = [];

  // 각 리액션 이모지에 대해 (숫자 이모지만 필터링)
  for (let bookIndex = 0; bookIndex < EMOJI_MAPPING.length; bookIndex++) {
    const emojiInfo = EMOJI_MAPPING[bookIndex];
    const reaction = reactions.find((r: any) => r.name === emojiInfo.reaction);

    // 해당 이모지에 반응한 사용자가 있다면
    if (reaction && reaction.users && bookIndex < bookTitles.length) {
      // 각 사용자를 배열에 추가
      for (const userId of reaction.users) {
        allUsers.push({
          bookIndex,
          userId,
          bookTitle: bookTitles[bookIndex],
        });
      }
    }
  }

  return allUsers;
}

// 사용자들을 그룹에 할당하고 초과 인원 처리
export function assignUsersToGroups(
  allUsers: ReactionUser[],
  bookTitles: string[],
  personLimit: number,
): { bookGroups: BookGroup[]; unassignedUsers: ReactionUser[] } {
  const bookGroups: BookGroup[] = [];
  const unassignedUsers: ReactionUser[] = [];

  // 각 책에 대해 그룹 초기화
  for (let i = 0; i < bookTitles.length; i++) {
    bookGroups.push({
      bookIndex: i,
      bookTitle: bookTitles[i],
      members: [],
      isFull: false,
    });
  }

  // 각 책 그룹에 사용자 할당
  for (const user of allUsers) {
    const group = bookGroups[user.bookIndex];

    // 인원제한에 도달하지 않았으면 그룹에 추가
    if (group.members.length < personLimit) {
      group.members.push(user.userId);

      // 인원제한에 도달하면 isFull 설정
      if (group.members.length === personLimit) {
        group.isFull = true;
      }
    } else {
      // 인원제한 초과면 미할당 사용자 목록에 추가
      unassignedUsers.push(user);
    }
  }

  return { bookGroups, unassignedUsers };
}

// 미할당 사용자를 다른 그룹으로 재배치
export function reassignUnassignedUsers(
  bookGroups: BookGroup[],
  unassignedUsers: ReactionUser[],
  personLimit: number,
): void {
  if (unassignedUsers.length > 0) {
    // 인원이 덜 찬 그룹 필터링
    const nonFullGroups = bookGroups.filter((group) => !group.isFull);

    // 인원이 덜 찬 그룹이 있다면 재배치
    if (nonFullGroups.length > 0) {
      for (const user of unassignedUsers) {
        // 랜덤하게 그룹 선택 (단순 랜덤 배정)
        const randomGroupIndex = Math.floor(
          Math.random() * nonFullGroups.length,
        );
        const targetGroup = nonFullGroups[randomGroupIndex];

        // 그룹에 사용자 추가
        targetGroup.members.push(user.userId);

        // 그룹이 가득 찼다면 목록에서 제거
        if (targetGroup.members.length === personLimit) {
          targetGroup.isFull = true;
          nonFullGroups.splice(randomGroupIndex, 1);

          // 더 이상 할당할 그룹이 없으면 종료
          if (nonFullGroups.length === 0) {
            break;
          }
        }
      }
    }
  }
}

// 그룹 상태 메시지 생성
export function createGroupStatusMessage(
  group: BookGroup,
  personLimit: number,
): string {
  // 그룹 상태 표시 (인원제한 충족 또는 미달)
  const groupStatus = group.isFull
    ? "✅ 인원이 모두 찼습니다!"
    : "⚠️ 인원이 부족합니다";

  // 사용자 멘션 생성
  const mentions = group.members.map((userId) => `<@${userId}>`).join(" ");

  // 그룹 메시지 생성 - 제목과 멘션을 함께 반환
  return `📚 *${group.bookTitle}* (${group.members.length}/${personLimit}명) ${groupStatus}\n${mentions}`;
}
