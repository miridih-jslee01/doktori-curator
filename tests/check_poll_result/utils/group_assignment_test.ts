//import { assertEquals } from "jsr:@std/assert";
//import {
//  ReactionUser,
//} from "../../../functions/check_poll_result/utils/types.ts";
//import {
//  assignUsersToGroups,
//} from "../../../functions/check_poll_result/utils/group_assignment.ts";

// 테스트 그룹 1: 기본 시나리오 - 인원 초과 그룹에서 다른 그룹으로 재배치
//Deno.test("기본 시나리오: 인원 초과된 그룹에서 다른 그룹으로 재배치", async (t) => {
//  // Arrange - 테스트 데이터 설정
//  const bookTitles = ["소프트웨어 장인", "클린 코드", "리팩터링"];
//  const users: ReactionUser[] = [
//    // 첫 번째 책에 6명 투표
//    { bookIndex: 0, userId: "U001", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U002", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U003", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U004", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U005", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U006", bookTitle: bookTitles[0] },
//
//    // 두 번째 책에 2명 투표
//    { bookIndex: 1, userId: "U007", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U008", bookTitle: bookTitles[1] },
//
//    // 세 번째 책에 1명 투표
//    { bookIndex: 2, userId: "U009", bookTitle: bookTitles[2] },
//  ];
//
//  const personLimit = 4; // 그룹당 최대 4명
//
//  // Act - 함수 실행
//  const { bookGroups, unassignedUsers } = assignUsersToGroups(
//    users,
//    bookTitles,
//    personLimit
//  );
//
//  // 미할당 사용자 재배치 실행
//  reassignUnassignedUsers(bookGroups, unassignedUsers, personLimit);
//
//  // 서브테스트 1: 초기 그룹 할당 검증
//  await t.step("초기 그룹 할당", () => {
//    // 첫 번째 책은 4명만 배정되고 2명은 unassignedUsers에 있어야 함
//    assertEquals(bookGroups[0].members.length, 4, "첫 번째 그룹은 제한인원(4명)만 배정되어야 함");
//    assertEquals(unassignedUsers.length, 2, "초과 인원 2명이 미할당 상태여야 함");
//  });
//
//  // 서브테스트 2: 모든 사용자 배정 검증
//  await t.step("모든 사용자가 어딘가에 배정됨", () => {
//    const totalAssigned = bookGroups.reduce(
//      (sum, group) => sum + group.members.length, 
//      0
//    );
//    assertEquals(totalAssigned, 9, "총 9명 모두 배정되어야 함");
//  });
//
//  // 서브테스트 3: 인원 제한 준수 검증
//  await t.step("인원제한 준수", () => {
//    bookGroups.forEach((group, index) => {
//      assertEquals(
//        group.members.length <= personLimit, 
//        true, 
//        `그룹 ${index+1}(${group.bookTitle})의 인원이 제한(${personLimit}명)을 초과함`
//      );
//    });
//  });
//
//  // 서브테스트 4: 그룹별 배정 결과 출력 (검증은 하지 않음)
//  await t.step("그룹별 배정 결과 출력", () => {
//    console.log("그룹별 최종 인원 구성:");
//    bookGroups.forEach(group => {
//      console.log(`'${group.bookTitle}' 그룹: ${group.members.length}명`);
//      console.log(` - 멤버: ${group.members.join(", ")}`);
//    });
//  });
//});
//
//// 테스트 그룹 2: 모든 그룹이 가득 찬 경우
//Deno.test("모든 그룹이 가득 찬 경우 (극단적 상황)", async (t) => {
//  // Arrange
//  const bookTitles = ["도서1", "도서2"];
//  const users: ReactionUser[] = [
//    // 첫 번째 책에 6명 투표
//    { bookIndex: 0, userId: "U001", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U002", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U003", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U004", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U005", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U006", bookTitle: bookTitles[0] },
//
//    // 두 번째 책에 5명 투표
//    { bookIndex: 1, userId: "U007", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U008", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U009", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U010", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U011", bookTitle: bookTitles[1] },
//  ];
//
//  const personLimit = 4; // 그룹당 최대 4명
//
//  // Act
//  const { bookGroups, unassignedUsers } = assignUsersToGroups(
//    users,
//    bookTitles,
//    personLimit
//  );
//
//  // 모든 그룹이 이미 가득 찼으므로 재배치할 곳이 없음
//  reassignUnassignedUsers(bookGroups, unassignedUsers, personLimit);
//
//  // 서브테스트 1: 초기 배정 검증
//  await t.step("모든 그룹이 인원제한에 도달함", () => {
//    assertEquals(bookGroups[0].members.length, 4, "첫 번째 그룹이 가득 차야 함");
//    assertEquals(bookGroups[1].members.length, 4, "두 번째 그룹이 가득 차야 함");
//  });
//
//  // 서브테스트 2: 재배치 불가능한 사용자 확인
//  await t.step("재배치되지 않은 사용자 존재", () => {
//    assertEquals(unassignedUsers.length, 3, "3명의 사용자가 배정되지 못함");
//    console.log(`재배치하지 못한 사용자 수: ${unassignedUsers.length}명`);
//  });
//});
//
//// 테스트 그룹 3: 딱 맞게 배정되는 경우
//Deno.test("정확히 인원제한에 맞게 배정되는 경우", async (t) => {
//  // Arrange
//  const bookTitles = ["파이썬 기초", "자바스크립트 기초", "Go 언어"];
//  const users: ReactionUser[] = [
//    // 첫 번째 책에 3명 투표
//    { bookIndex: 0, userId: "U001", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U002", bookTitle: bookTitles[0] },
//    { bookIndex: 0, userId: "U003", bookTitle: bookTitles[0] },
//
//    // 두 번째 책에 4명 투표 (딱 맞음)
//    { bookIndex: 1, userId: "U004", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U005", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U006", bookTitle: bookTitles[1] },
//    { bookIndex: 1, userId: "U007", bookTitle: bookTitles[1] },
//
//    // 세 번째 책에 2명 투표
//    { bookIndex: 2, userId: "U008", bookTitle: bookTitles[2] },
//    { bookIndex: 2, userId: "U009", bookTitle: bookTitles[2] },
//  ];
//
//  const personLimit = 4; // 그룹당 최대 4명
//
//  // Act
//  const { bookGroups, unassignedUsers } = assignUsersToGroups(
//    users, 
//    bookTitles,
//    personLimit
//  );
//
//  // 재배치 함수 호출 (아무 일도 일어나지 않아야 함)
//  reassignUnassignedUsers(bookGroups, unassignedUsers, personLimit);
//
//  // 서브테스트 1: 미할당 인원 없음 검증
//  await t.step("미할당 인원 없음", () => {
//    assertEquals(unassignedUsers.length, 0, "미할당 인원이 없어야 함");
//  });
//
//  // 서브테스트 2: 그룹별 인원 검증
//  await t.step("각 그룹의 인원이 초기 배정과 동일함", () => {
//    assertEquals(bookGroups[0].members.length, 3, "첫 번째 그룹은 3명이어야 함");
//    assertEquals(bookGroups[1].members.length, 4, "두 번째 그룹은 4명이어야 함");
//    assertEquals(bookGroups[2].members.length, 2, "세 번째 그룹은 2명이어야 함");
//  });
//
//  // 서브테스트 3: 인원제한 충족 상태 검증
//  await t.step("인원제한 충족 상태 확인", () => {
//    assertEquals(bookGroups[0].isFull, false, "첫 번째 그룹은 가득 차지 않아야 함");
//    assertEquals(bookGroups[1].isFull, true, "두 번째 그룹은 가득 차야 함");
//    assertEquals(bookGroups[2].isFull, false, "세 번째 그룹은 가득 차지 않아야 함");
//
//    console.log("모든 그룹 구성:");
//    bookGroups.forEach(group => {
//      console.log(`'${group.bookTitle}' 그룹: ${group.members.length}/${personLimit}명`);
//    });
//  });
//}); 
