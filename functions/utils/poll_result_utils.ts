import { EMOJI_MAPPING } from "./emoji_mapping.ts";

// 슬랙 API 응답에서 사용하는 리액션 객체 타입 정의
interface SlackReaction {
  name: string;
  users: string[];
  count: number;
}

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

/**
 * Fisher-Yates 알고리즘을 사용하여 배열을 무작위로 섞습니다.
 * 모든 요소가 동일한 확률로 섞이는 공정한 셔플링을 보장합니다.
 */
function shuffleArray<T>(array: T[]): T[] {
  // 원본 배열을 변경하지 않기 위해 복사본 생성
  const shuffled = [...array];

  // Fisher-Yates 셔플 알고리즘
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * 그룹의 인원이 제한에 도달했는지 확인하고 상태를 업데이트합니다.
 */
function updateGroupFullStatus(group: BookGroup, personLimit: number): void {
  if (group.members.length === personLimit) {
    group.isFull = true;
  }
}

/**
 * 리액션 데이터로부터 사용자 정보를 추출합니다.
 */
export function extractUsersFromReactions(
  reactions: SlackReaction[],
  bookTitles: string[],
): ReactionUser[] {
  const allUsers: ReactionUser[] = [];

  // 각 리액션 이모지에 대해 (숫자 이모지만 필터링)
  for (let bookIndex = 0; bookIndex < EMOJI_MAPPING.length; bookIndex++) {
    const emojiInfo = EMOJI_MAPPING[bookIndex];
    const reaction = reactions.find((r) => r.name === emojiInfo.reaction);

    // 해당 이모지에 반응한 사용자가 있다면
    if (reaction?.users && bookIndex < bookTitles.length) {
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

/**
 * 사용자들을 도서별로 분류합니다.
 */
function categorizeUsersByBook(
  allUsers: ReactionUser[],
  bookTitlesCount: number,
): ReactionUser[][] {
  const usersByBook: ReactionUser[][] = Array(bookTitlesCount)
    .fill(null)
    .map(() => []);

  // 각 사용자를 해당 책 그룹에 분류
  for (const user of allUsers) {
    if (user.bookIndex < bookTitlesCount) {
      usersByBook[user.bookIndex].push(user);
    }
  }

  return usersByBook;
}

/**
 * 책 그룹을 초기화합니다.
 */
function initializeBookGroups(bookTitles: string[]): BookGroup[] {
  return bookTitles.map((title, index) => ({
    bookIndex: index,
    bookTitle: title,
    members: [],
    isFull: false,
  }));
}

/**
 * 책 그룹에 사용자를 할당합니다. 인원 제한을 초과하는 사용자는 미할당 목록에 추가합니다.
 */
function assignUsersToBookGroup(
  users: ReactionUser[],
  group: BookGroup,
  personLimit: number,
): ReactionUser[] {
  const unassigned: ReactionUser[] = [];

  // 인원 제한을 초과하면 무작위로 선택
  if (users.length > personLimit) {
    // 사용자 목록을 무작위로 섞기
    const shuffledUsers = shuffleArray(users);

    // personLimit 만큼만 그룹에 추가하고 나머지는 미할당 목록에 추가
    shuffledUsers.forEach((user, index) => {
      if (index < personLimit) {
        group.members.push(user.userId);
      } else {
        unassigned.push(user);
      }
    });

    updateGroupFullStatus(group, personLimit);
  } else {
    // 인원 제한 이하면 모두 할당
    users.forEach((user) => group.members.push(user.userId));
    updateGroupFullStatus(group, personLimit);
  }

  return unassigned;
}

/**
 * 사용자들을 그룹에 할당하고 초과 인원을 처리합니다 (공정한 방식).
 */
export function assignUsersToGroups(
  allUsers: ReactionUser[],
  bookTitles: string[],
  personLimit: number,
): { bookGroups: BookGroup[]; unassignedUsers: ReactionUser[] } {
  // 책 그룹 초기화
  const bookGroups = initializeBookGroups(bookTitles);
  let unassignedUsers: ReactionUser[] = [];

  // 사용자를 책별로 분류
  const usersByBook = categorizeUsersByBook(allUsers, bookTitles.length);

  // 각 책 그룹에 사용자 할당
  bookGroups.forEach((group, index) => {
    const usersForThisBook = usersByBook[index];
    const newUnassigned = assignUsersToBookGroup(
      usersForThisBook,
      group,
      personLimit,
    );
    unassignedUsers = [...unassignedUsers, ...newUnassigned];
  });

  return { bookGroups, unassignedUsers };
}

/**
 * 그룹을 기반으로 사용자를 재배치할 대상 그룹을 선택합니다.
 */
function selectTargetGroup(nonFullGroups: BookGroup[]): {
  targetGroup: BookGroup;
  groupIndex: number;
} {
  const groupIndex = Math.floor(Math.random() * nonFullGroups.length);
  return {
    targetGroup: nonFullGroups[groupIndex],
    groupIndex,
  };
}

/**
 * 미할당 사용자를 다른 그룹으로 재배치합니다.
 */
export function reassignUnassignedUsers(
  bookGroups: BookGroup[],
  unassignedUsers: ReactionUser[],
  personLimit: number,
): void {
  if (unassignedUsers.length === 0) return;

  // 인원이 덜 찬 그룹 필터링
  const nonFullGroups = bookGroups.filter((group) => !group.isFull);
  if (nonFullGroups.length === 0) return;

  // 미할당 사용자를 무작위로 섞어 공정하게 재배치
  const shuffledUsers = shuffleArray(unassignedUsers);

  // 각 미할당 사용자 재배치
  for (const user of shuffledUsers) {
    if (nonFullGroups.length === 0) break;

    // 랜덤하게 그룹 선택
    const { targetGroup, groupIndex } = selectTargetGroup(nonFullGroups);

    // 그룹에 사용자 추가
    targetGroup.members.push(user.userId);

    // 그룹이 가득 찼다면 목록에서 제거
    if (targetGroup.members.length === personLimit) {
      targetGroup.isFull = true;
      nonFullGroups.splice(groupIndex, 1);
    }
  }
}

/**
 * 그룹 상태 메시지를 생성합니다.
 */
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
