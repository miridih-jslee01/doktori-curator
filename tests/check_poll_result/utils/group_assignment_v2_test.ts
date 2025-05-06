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
      expected: number[];
    }[] = [
      {
        name: "미충족 그룹1",
        inputBookGroups: [
          { bookTitle: "마음", members: ["user1", "user2", "user3"] },
        ],
        min: 4,
        expected: [3],
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
        expected: [7],
      },
      {
          name: '미충족 그룹3, 충족 그룹1',
        inputBookGroups: [
          { bookTitle: "asfsfa", members: [] },
          { bookTitle: "xzczxc", members: ["U03M9L667KR"] },
          { bookTitle: "sadasda", members: [] },
          { bookTitle: "zxcxzczxc", members: [] },
        ],
          min: 4,
          expected: [1]
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
        tc.expected
      );
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
      expected: number[];
    }[] = [
      {
        name: "미충족(인원3), 충족(인원5)",
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
        expected: [4, 4],
      },
      {
        name: "미충족(인원2), 충족(인원6)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1", "user2"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user3", "user4", "user5", "user6", "user7", "user8"],
          },
        ],
        min: 4,
        expected: [4, 4],
      },
      {
        name: "미충족(인원1), 충족(인원7)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: [
              "user2",
              "user3",
              "user4",
              "user5",
              "user6",
              "user7",
              "user8",
            ],
          },
        ],
        min: 4,
        expected: [4, 4],
      },
      {
        name: "미충족(인원1), 충족(인원8), 미충족(인원3)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: [
              "user2",
              "user3",
              "user4",
              "user5",
              "user6",
              "user7",
              "user8",
              "user9",
            ],
          },
          {
            bookTitle: "도둑맞은 집중력",
            members: ["user10", "user11", "user12"],
          },
        ],
        min: 4,
        expected: [4, 4, 4],
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
        tc.expected
      );
    }
  }
);

Deno.test(
  "그룹 재배정 이후, 미충족 그룹이 충족 그룹이 될만큼 충족 그룹들에 여유인원이 없다면, 미충족 그룹은 가장 적은 인원의 그룹부터 통폐합되어야 한다.",
  () => {
    const testCases: {
      name: string;
      inputBookGroups: BookGroup[];
      min: number;
      expected: number[];
    }[] = [
      {
        name: "미충족(인원1), 충족(인원5)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user2", "user3", "user4", "user5", "user6"],
          },
        ],
        min: 4,
        expected: [6],
      },
      {
        name: "미충족(인원1), 충족(인원4), 미충족(인원3)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user2", "user3", "user4", "user5"],
          },
          {
            bookTitle: "도둑맞은 집중력",
            members: ["user6", "user7", "user8"],
          },
        ],
        min: 4,
        expected: [4, 4],
      },
      {
        name: "미충족(인원2), 충족(인원4), 미충족(인원2)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1", "user2"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user3", "user4", "user5", "user6"],
          },
          {
            bookTitle: "도둑맞은 집중력",
            members: ["user7", "user8"],
          },
        ],
        min: 4,
        expected: [4, 4],
      },
      {
        name: "미충족(인원1), 충족(인원4), 미충족(인원2)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user2", "user3", "user4", "user5"],
          },
          {
            bookTitle: "도둑맞은 집중력",
            members: ["user6", "user7"],
          },
        ],
        min: 4,
        expected: [7],
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
        tc.expected
      );
    }
  }
);

Deno.test(
  "그룹 재배정 이후, 미충족 그룹이 충족 그룹이 될만큼 충족 그룹들에 여유인원이 없다면, 미충족 그룹은 가장 적은 인원의 그룹부터 통폐합되고, 그 이후 충족 그룹들에 여유인원이 있다면 미충족 그룹은 가능한한 충족 그룹이 되어야 한다.",
  () => {
    const testCases: {
      name: string;
      inputBookGroups: BookGroup[];
      min: number;
      expected: number[][];
    }[] = [
      {
        name: "미충족(인원1), 충족(인원5), 미충족(인원2)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user2", "user3", "user4", "user5", "user6"],
          },
          {
            bookTitle: "도둑맞은 집중력",
            members: ["user7", "user8"],
          },
        ],
        min: 4,
        expected: [[4, 4]],
      },
      {
        name: "충족(인원5), 충족(인원5), 미충족(인원1), 미충족(인원2)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1", "user2", "user3", "user4", "user5"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: ["user6", "user7", "user8", "user9", "user10"],
          },
          {
            bookTitle: "도둑맞은 집중력",
            members: ["user11"],
          },
          {
            bookTitle: "모든 계절이 유서였다",
            members: ["user12", "user13"],
          },
        ],
        min: 4,
        expected: [
          [5, 4, 4],
          [4, 5, 4],
        ],
      },
    ];

    for (const tc of testCases) {
      console.log(tc.name);
      const assignmentCompletedGroups = reassignmentGroups(
        tc.inputBookGroups,
        tc.min
      );
      recursiveAssertEquals(
        assignmentCompletedGroups.map((group) => group.members.length),
        tc.expected
      );
    }
  }
);

const recursiveAssertEquals = <T>(inputs: T[], testCases: T[][], idx = 0) => {
  try {
    return assertEquals(inputs, testCases[idx]);
  } catch {
    return recursiveAssertEquals(inputs, testCases, idx + 1);
  }
};

Deno.test(
  "인원제한을 초과한 그룹이 있다면, 가능한한 초과하지 않도록 다른 그룹으로 인원을 분배한다.",
  () => {
    const testCases: {
      name: string;
      inputBookGroups: BookGroup[];
      min?: number;
      max: number;
      expected: number[];
    }[] = [
      {
        name: "충족(인원4), 충족(인원7)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1", "user2", "user3", "user4"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: [
              "user5",
              "user6",
              "user7",
              "user8",
              "user9",
              "user10",
              "user11",
            ],
          },
        ],
        min: 4,
        max: 6,
        expected: [5, 6],
      },
      {
        name: "충족(인원5), 충족(인원8), 충족(인원6)",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1", "user2", "user3", "user4", "user5"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: [
              "user6",
              "user7",
              "user8",
              "user9",
              "user10",
              "user11",
              "user12",
              "user13",
            ],
          },
          {
            bookTitle: "도둑맞은 집중력",
            members: [
              "user14",
              "user15",
              "user16",
              "user17",
              "user18",
              "user19",
            ],
          },
        ],
        min: 4,
        max: 6,
        expected: [6, 7, 6],
      },
      {
        name: "인원5, 인원8",
        inputBookGroups: [
          {
            bookTitle: "마음",
            members: ["user1", "user2", "user3", "user4", "user5"],
          },
          {
            bookTitle: "에디토리얼 씽킹",
            members: [
              "user6",
              "user7",
              "user8",
              "user9",
              "user10",
              "user11",
              "user12",
              "user13",
            ],
          },
        ],
        max: 6,
        expected: [6, 7],
      },
    ];

    for (const tc of testCases) {
      console.log(tc.name);
      const assignmentCompletedGroups = reassignmentGroups(
        tc.inputBookGroups,
        tc.min,
        tc.max
      );
      assertEquals(
        assignmentCompletedGroups.map((group) => group.members.length),
        tc.expected
      );
    }
  }
);
