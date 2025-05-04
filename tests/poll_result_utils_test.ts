import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  ReactionUser,
  assignUsersToGroups,
  reassignUnassignedUsers,
} from "../functions/utils/poll_result_utils.ts";

// 테스트 1: 기본 시나리오 - 인원 초과 그룹에서 다른 그룹으로 재배치
Deno.test("기본 시나리오: 인원 초과된 그룹에서 다른 그룹으로 재배치", () => {
  // Arrange - 테스트 데이터 설정
  const bookTitles = ["소프트웨어 장인", "클린 코드", "리팩터링"];
  const users: ReactionUser[] = [
    // 첫 번째 책에 6명 투표
    { bookIndex: 0, userId: "U001", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U002", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U003", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U004", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U005", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U006", bookTitle: bookTitles[0] },
    
    // 두 번째 책에 2명 투표
    { bookIndex: 1, userId: "U007", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U008", bookTitle: bookTitles[1] },
    
    // 세 번째 책에 1명 투표
    { bookIndex: 2, userId: "U009", bookTitle: bookTitles[2] },
  ];
  
  const personLimit = 4; // 그룹당 최대 4명
  
  // Act - 함수 실행
  const { bookGroups, unassignedUsers } = assignUsersToGroups(
    users,
    bookTitles,
    personLimit
  );
  
  // 첫 번째 책은 4명만 배정되고 2명은 unassignedUsers에 있어야 함
  assertEquals(bookGroups[0].members.length, 4);
  assertEquals(unassignedUsers.length, 2);
  
  // 미할당 사용자 재배치 실행
  reassignUnassignedUsers(bookGroups, unassignedUsers, personLimit);
  
  // Assert - 결과 검증
  // 모든 사용자가 어딘가에 배정되어야 함
  const totalAssigned = bookGroups.reduce(
    (sum, group) => sum + group.members.length, 
    0
  );
  assertEquals(totalAssigned, 9); // 총 9명 모두 배정됨
  
  // 각 그룹의 인원 확인 (각 그룹이 인원제한을 초과하지 않아야 함)
  bookGroups.forEach(group => {
    assertEquals(group.members.length <= personLimit, true);
  });
  
  // 어느 그룹으로 재배치되었는지 확인
  console.log("그룹별 최종 인원 구성:");
  bookGroups.forEach(group => {
    console.log(`'${group.bookTitle}' 그룹: ${group.members.length}명`);
    console.log(` - 멤버: ${group.members.join(", ")}`);
  });
});

// 테스트 2: 모든 그룹이 가득 찬 경우
Deno.test("모든 그룹이 가득 찬 경우 (극단적 상황)", () => {
  // Arrange
  const bookTitles = ["도서1", "도서2"];
  const users: ReactionUser[] = [
    // 첫 번째 책에 6명 투표
    { bookIndex: 0, userId: "U001", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U002", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U003", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U004", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U005", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U006", bookTitle: bookTitles[0] },
    
    // 두 번째 책에 5명 투표
    { bookIndex: 1, userId: "U007", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U008", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U009", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U010", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U011", bookTitle: bookTitles[1] },
  ];
  
  const personLimit = 4; // 그룹당 최대 4명
  
  // Act
  const { bookGroups, unassignedUsers } = assignUsersToGroups(
    users,
    bookTitles,
    personLimit
  );
  
  // 두 그룹 모두 4명씩 배정되고 3명은 unassignedUsers에 있어야 함
  assertEquals(bookGroups[0].members.length, 4);
  assertEquals(bookGroups[1].members.length, 4);
  assertEquals(unassignedUsers.length, 3);
  
  // 모든 그룹이 이미 가득 찼으므로 재배치할 곳이 없음
  reassignUnassignedUsers(bookGroups, unassignedUsers, personLimit);
  
  // Assert
  // 모든 그룹은 여전히 꽉 차 있어야 함
  assertEquals(bookGroups[0].members.length, 4);
  assertEquals(bookGroups[1].members.length, 4);
  
  // 재배치되지 못한 사용자들이 있는지 확인 (로그 출력)
  console.log(`재배치하지 못한 사용자 수: ${unassignedUsers.length}명`);
  
  // 모든 그룹이 가득 찬 경우에는 미할당 사용자가 그대로 남아있어야 함
  assertEquals(unassignedUsers.length, 3);
});

// 테스트 3: 딱 맞게 배정되는 경우
Deno.test("정확히 인원제한에 맞게 배정되는 경우", () => {
  // Arrange
  const bookTitles = ["파이썬 기초", "자바스크립트 기초", "Go 언어"];
  const users: ReactionUser[] = [
    // 첫 번째 책에 3명 투표
    { bookIndex: 0, userId: "U001", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U002", bookTitle: bookTitles[0] },
    { bookIndex: 0, userId: "U003", bookTitle: bookTitles[0] },
    
    // 두 번째 책에 4명 투표 (딱 맞음)
    { bookIndex: 1, userId: "U004", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U005", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U006", bookTitle: bookTitles[1] },
    { bookIndex: 1, userId: "U007", bookTitle: bookTitles[1] },
    
    // 세 번째 책에 2명 투표
    { bookIndex: 2, userId: "U008", bookTitle: bookTitles[2] },
    { bookIndex: 2, userId: "U009", bookTitle: bookTitles[2] },
  ];
  
  const personLimit = 4; // 그룹당 최대 4명
  
  // Act
  const { bookGroups, unassignedUsers } = assignUsersToGroups(
    users, 
    bookTitles,
    personLimit
  );
  
  // 모든 사용자가 초기 그룹에 배정되어야 함 (초과 인원 없음)
  assertEquals(unassignedUsers.length, 0);
  
  // 재배치 함수 호출 (아무 일도 일어나지 않아야 함)
  reassignUnassignedUsers(bookGroups, unassignedUsers, personLimit);
  
  // Assert - 원래 배정과 동일해야 함
  assertEquals(bookGroups[0].members.length, 3);
  assertEquals(bookGroups[1].members.length, 4);
  assertEquals(bookGroups[2].members.length, 2);
  
  // 두 번째 그룹만 가득 차 있어야 함
  assertEquals(bookGroups[0].isFull, false);
  assertEquals(bookGroups[1].isFull, true);
  assertEquals(bookGroups[2].isFull, false);
  
  console.log("모든 그룹 구성:");
  bookGroups.forEach(group => {
    console.log(`'${group.bookTitle}' 그룹: ${group.members.length}/${personLimit}명`);
  });
}); 