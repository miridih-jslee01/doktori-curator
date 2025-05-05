import { assertEquals } from "jsr:@std/assert";

Deno.test("일단 통과하는 테스트", (t) => {
  assertEquals(5, 5);
})
