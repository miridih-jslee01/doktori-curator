import { assertEquals } from "jsr:@std/assert";
import {
  BookGroup,
  reassignmentGroups,
} from "../../../functions/check_poll_result/utils/group_assignment_v2.ts";

Deno.test("그룹 재배정 이후, 책 그룹 목록 결과를 확인할 수 있다.", () => {
  const bookGroups: BookGroup[] = [];
  const assignmentCompletedGroups = reassignmentGroups(bookGroups);
  assertEquals(assignmentCompletedGroups, []);
});

Deno.test(
  "그룹 재배정 이후, 최소 인원을 충족하지 못한 그룹은 없어야 한다.",
  () => {
    const bookGroups: BookGroup[] = [
      { bookTitle: "마음", members: ["user1", "user2", "user3"] },
    ];
    const min = 4;

    const assignmentCompletedGroups = reassignmentGroups(bookGroups, min);
    assertEquals(assignmentCompletedGroups, []);
  }
);

Deno.test(
  "그룹 재배정 이후, 최소 인원을 충족하지 못한 그룹은 없어야 한다. 2",
  () => {
    const bookGroups: BookGroup[] = [
      { bookTitle: "마음", members: ["user1", "user2", "user3"] },
      {
        bookTitle: "에디토리얼 씽킹",
        members: ["user1", "user2", "user3", "user4"],
      },
    ];
    const min = 4;

    const assignmentCompletedGroups = reassignmentGroups(bookGroups, min);
    assertEquals(assignmentCompletedGroups, [
      {
        bookTitle: "에디토리얼 씽킹",
        members: ["user1", "user2", "user3", "user4"],
      },
    ]);
  }
);
