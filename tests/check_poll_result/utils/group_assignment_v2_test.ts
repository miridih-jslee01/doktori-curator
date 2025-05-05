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
      name: string;
      inputBookGroups: BookGroup[];
      min: number;
      expected: BookGroup[];
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

Deno.test(
  "그룹 재배정 이후, 미충족 그룹이 충족 그룹이 될만큼 충족 그룹들에 여유인원이 있다면, 미충족 그룹은 가능한한 충족 그룹이 되어야 한다.",
  () => {
    const testCases: {
      name: string;
      inputBookGroups: BookGroup[];
      min: number;
      expected: BookGroup[];
    }[] = [
      {
        name: "미충족(인원3), 충족(인원6)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1", "user2", "user3"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user4", "user5", "user6", "user7", "user8"],
          },
        ],
        min: 4,
        expected: [
          {
            bookTitle: "마음",
            members: ["user1", "user2", "user7", "user8"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user3", "user4", "user5", "user6"],
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
      assertEquals(
        assignmentCompletedGroups.map((group) => group.members.length),
        tc.expected.map((group) => group.members.length)
      );
    }
  }
);
