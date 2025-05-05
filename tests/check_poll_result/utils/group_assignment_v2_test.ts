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
    const testCases: {
      name: string,
      inputBookGroups: BookGroup[],
      min: number,
      expected: BookGroup[]
    }[] = [
      {
        name: "미충족 그룹1",
        inputBookGroups: [
          { bookTitle: "마음", members: ["user1", "user2", "user3"] },
        ],
        min: 4,
        expected: [],
      },
      {
        name: "미충족 그룹1, 충족 그룹1",
        inputBookGroups: [
          { bookTitle: "마음", members: ["user1", "user2", "user3"] },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user1", "user2", "user3", "user4"],
          },
        ],
        min: 4,
        expected: [
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user1", "user2", "user3", "user4"],
          },
        ],
      },
    ];
    for (const tc of testCases) {
      console.log(tc.name);
      const assignmentCompletedGroups = reassignmentGroups(
        tc.inputBookGroups,
        tc.min
      );
      assertEquals(assignmentCompletedGroups, tc.expected);
    }
  }
);
