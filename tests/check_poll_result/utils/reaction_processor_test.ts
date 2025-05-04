import { assertEquals } from "jsr:@std/assert";
import { extractUsersFromReactions } from "../../../functions/check_poll_result/utils/reaction_processor.ts";
import { SlackReaction } from "../../../functions/check_poll_result/utils/types.ts";

// 기본 시나리오용 공통 테스트 데이터
const setupBasicTestData = () => {
  const bookTitles = ["도서1", "도서2", "도서3"];
  const reactions: SlackReaction[] = [
    { name: "one", users: ["U001", "U002", "U003"], count: 3 },
    { name: "two", users: ["U004", "U005"], count: 2 },
    { name: "three", users: ["U006"], count: 1 },
    { name: "thumbsup", users: ["U007"], count: 1 }, // 관련 없는 이모지
  ];
  
  return { bookTitles, reactions };
};

Deno.test("extractUsersFromReactions는 총 사용자 수를 정확히 추출해야 함", () => {
  // Arrange
  const { bookTitles, reactions } = setupBasicTestData();

  // Act
  const result = extractUsersFromReactions(reactions, bookTitles);

  // Assert
  assertEquals(result.length, 6, "총 6명의 사용자가 추출되어야 함");
});

Deno.test("extractUsersFromReactions는 첫 번째 책에 투표한 사용자를 정확히 추출해야 함", () => {
  // Arrange
  const { bookTitles, reactions } = setupBasicTestData();

  // Act
  const result = extractUsersFromReactions(reactions, bookTitles);
  
  // Assert
  const book1Voters = result.filter(user => user.bookIndex === 0);
  assertEquals(book1Voters.length, 3, "첫 번째 책에 3명이 투표해야 함");
});

Deno.test("extractUsersFromReactions는 첫 번째 책 제목을 정확히 매핑해야 함", () => {
  // Arrange
  const { bookTitles, reactions } = setupBasicTestData();

  // Act
  const result = extractUsersFromReactions(reactions, bookTitles);
  
  // Assert
  const book1Voters = result.filter(user => user.bookIndex === 0);
  assertEquals(book1Voters[0].bookTitle, "도서1", "첫 번째 책 제목이 일치해야 함");
});

Deno.test("extractUsersFromReactions는 두 번째 책에 투표한 사용자를 정확히 추출해야 함", () => {
  // Arrange
  const { bookTitles, reactions } = setupBasicTestData();

  // Act
  const result = extractUsersFromReactions(reactions, bookTitles);
  
  // Assert
  const book2Voters = result.filter(user => user.bookIndex === 1);
  assertEquals(book2Voters.length, 2, "두 번째 책에 2명이 투표해야 함");
});

Deno.test("extractUsersFromReactions는 세 번째 책에 투표한 사용자를 정확히 추출해야 함", () => {
  // Arrange
  const { bookTitles, reactions } = setupBasicTestData();

  // Act
  const result = extractUsersFromReactions(reactions, bookTitles);
  
  // Assert
  const book3Voters = result.filter(user => user.bookIndex === 2);
  assertEquals(book3Voters.length, 1, "세 번째 책에 1명이 투표해야 함");
});

Deno.test("extractUsersFromReactions는 관련 없는 이모지 반응을 필터링해야 함", () => {
  // Arrange
  const { bookTitles, reactions } = setupBasicTestData();

  // Act
  const result = extractUsersFromReactions(reactions, bookTitles);
  
  // Assert
  const thumbsupVoters = result.filter(user => user.userId === "U007");
  assertEquals(thumbsupVoters.length, 0, "관련 없는 이모지 반응은 포함되지 않아야 함");
});

Deno.test("extractUsersFromReactions는 빈 반응 목록에 대해 빈 결과를 반환해야 함", () => {
  // Arrange
  const emptyReactions: SlackReaction[] = [];
  const bookTitles = ["도서1", "도서2"];
  
  // Act
  const result = extractUsersFromReactions(emptyReactions, bookTitles);
  
  // Assert
  assertEquals(result.length, 0, "빈 반응 목록은 빈 결과를 반환해야 함");
});

Deno.test("extractUsersFromReactions는 빈 책 목록에 대해 빈 결과를 반환해야 함", () => {
  // Arrange
  const reactions: SlackReaction[] = [
    { name: "one", users: ["U001"], count: 1 },
  ];
  const emptyBookTitles: string[] = [];
  
  // Act
  const result = extractUsersFromReactions(reactions, emptyBookTitles);
  
  // Assert
  assertEquals(result.length, 0, "빈 책 목록은 빈 결과를 반환해야 함");
});

Deno.test("extractUsersFromReactions는 책 목록보다 많은 반응이 있는 경우 적절히 필터링해야 함", () => {
  // Arrange
  const shortBookTitles = ["도서1"];
  const manyReactions: SlackReaction[] = [
    { name: "one", users: ["U001"], count: 1 },
    { name: "two", users: ["U002"], count: 1 },
  ];
  
  // Act
  const result = extractUsersFromReactions(manyReactions, shortBookTitles);
  
  // Assert
  assertEquals(result.length, 1, "책 목록 크기에 맞게 필터링되어야 함");
}); 