/**
 * 사용자를 책 그룹에 할당하는 로직을 담당하는 모듈
 */
import { GroupAssignmentResult, ReactionUser } from "./types.ts";
import { BookGroup, reassignmentGroups } from "./group_assignment_v2.ts";

/**
 * 책 그룹을 초기화합니다.
 */
function initializeBookGroups(bookTitles: string[]): BookGroup[] {
  return bookTitles.map((title) => ({
    bookTitle: title,
    members: [],
  }));
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
) {
  users.forEach((user) => group.members.push(user.userId));
}

/**
 * 사용자들을 그룹에 할당하고 초과 인원을 처리합니다.
 */
export function assignUsersToGroups(
  allUsers: ReactionUser[],
  bookTitles: string[],
  personMaxLimit: number,
  personMinLimit: number,
): GroupAssignmentResult {
  console.log(
    "assignUsersToGroups",
    allUsers,
    bookTitles,
    personMaxLimit,
    personMinLimit,
  );
  // 책 그룹 초기화
  const bookGroups = initializeBookGroups(bookTitles);
  // 사용자를 책별로 분류
  const usersByBook = categorizeUsersByBook(allUsers, bookTitles.length);
  console.log("usersByBook", usersByBook);

  // 각 책 그룹에 사용자 할당
  bookGroups.forEach((group, index) => {
    const usersForThisBook = usersByBook[index];
    assignUsersToBookGroup(
      usersForThisBook,
      group,
    );
  });
  console.log("bookGroups", bookGroups);
  const reassignedBookGroups = reassignmentGroups(
    bookGroups,
    personMinLimit,
    personMaxLimit,
  );
  console.log("reassignedBookGroups", reassignedBookGroups);

  return {
    bookGroups: reassignedBookGroups,
  };
}
