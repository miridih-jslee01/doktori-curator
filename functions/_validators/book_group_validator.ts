/**
 * 책 그룹 정보 공통 검증 유틸리티
 */
import {
  Result,
  safeParseArray,
  safeStringifyArray,
  ValidationResult,
} from "../utils/validators.ts";
import { BookGroup } from "../_types/book_group.ts";

/**
 * BookGroup 객체가 유효한지 검증합니다.
 *
 * @param obj 검증할 객체
 * @returns 검증 결과
 */
export function validateBookGroup(obj: unknown): ValidationResult {
  // null이거나 객체가 아닌 경우
  if (obj === null || typeof obj !== "object") {
    return { valid: false, error: "유효한 객체가 아닙니다." };
  }

  const group = obj as Record<string, unknown>;

  // 필수 필드 존재 여부 확인
  if (!("bookTitle" in group)) {
    return { valid: false, error: "bookTitle 필드가 없습니다." };
  }
  if (!("members" in group)) {
    return { valid: false, error: "members 필드가 없습니다." };
  }
  if (!("thread_ts" in group)) {
    return { valid: false, error: "thread_ts 필드가 없습니다." };
  }

  // 타입 확인
  if (typeof group.bookTitle !== "string" || group.bookTitle.trim() === "") {
    return {
      valid: false,
      error: "bookTitle은 비어있지 않은 문자열이어야 합니다.",
    };
  }
  if (typeof group.members !== "string") {
    return { valid: false, error: "members는 문자열이어야 합니다." };
  }
  if (typeof group.thread_ts !== "string" || group.thread_ts.trim() === "") {
    return {
      valid: false,
      error: "thread_ts는 비어있지 않은 문자열이어야 합니다.",
    };
  }

  return { valid: true };
}

/**
 * 책 그룹 배열을 안전하게 파싱합니다.
 *
 * @param jsonString 파싱할 JSON 문자열
 * @returns 파싱 및 검증 결과
 */
export function safeParseBookGroups(jsonString: string): Result<BookGroup[]> {
  return safeParseArray<BookGroup>(jsonString, validateBookGroup);
}

/**
 * 책 그룹 배열을 안전하게 JSON 문자열로 직렬화합니다.
 *
 * @param groups 직렬화할 책 그룹 배열
 * @returns 직렬화 결과
 */
export function safeStringifyBookGroups(groups: BookGroup[]): Result<string> {
  return safeStringifyArray<BookGroup>(groups, validateBookGroup);
}
