/**
 * 사용자를 책 그룹에 할당하는 로직을 담당하는 모듈
 */
import { BookGroup, GroupAssignmentResult, ReactionUser } from "./types.ts";
import { shuffle } from "../../_utils/arrays.ts";

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
 * 그룹의 인원이 제한에 도달했는지 확인하고 상태를 업데이트합니다.
 */
function updateGroupFullStatus(group: BookGroup, personLimit: number): void {
  if (group.members.length === personLimit) {
    group.isFull = true;
  }
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
    const shuffledUsers = shuffle(users);

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
 * 사용자들을 그룹에 할당하고 초과 인원을 처리합니다.
 */
export function assignUsersToGroups(
  allUsers: ReactionUser[],
  bookTitles: string[],
  personLimit: number,
): GroupAssignmentResult {
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
  const shuffledUsers = shuffle(unassignedUsers);

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
