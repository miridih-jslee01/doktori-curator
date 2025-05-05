import { assertEquals } from "jsr:@std/assert";
import { reassignmentGroups } from "../../../functions/check_poll_result/utils/group_assignment_v2.ts";

Deno.test("그룹 재배정이 일어난 후 책 그룹 목록 결과를 확인할 수 있다.", (t) => {
  const bookGroups: any[] = [];
  const assignmentCompletedGroups = reassignmentGroups(bookGroups);
  assertEquals([], assignmentCompletedGroups);
})
