/**
 * JSON 데이터 검증을 위한 유틸리티 모듈
 */

/**
 * 책 그룹 정보 인터페이스
 */
interface BookGroup {
  bookTitle: string; // 책 제목
  members: string; // 쉼표로 구분된 멤버 ID 목록
  thread_ts: string; // 스레드 타임스탬프
}

/**
 * BookGroup 객체가 유효한지 검증합니다.
 *
 * @param obj 검증할 객체
 * @returns 검증 결과 (유효 여부와 오류 메시지)
 */
function validateBookGroup(
  obj: unknown,
): { valid: boolean; error?: string } {
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
export function safeParseBookGroups(jsonString: string): {
  success: boolean;
  data?: BookGroup[];
  error?: string;
} {
  // 1. JSON 파싱 시도
  try {
    const parsed = JSON.parse(jsonString);

    // 2. 배열인지 확인
    if (!Array.isArray(parsed)) {
      return { success: false, error: "JSON 데이터가 배열이 아닙니다." };
    }

    // 3. 빈 배열 확인
    if (parsed.length === 0) {
      return { success: true, data: [] };
    }

    // 4. 각 항목 검증
    const validationErrors: string[] = [];
    const validGroups: BookGroup[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const result = validateBookGroup(parsed[i]);
      if (!result.valid) {
        validationErrors.push(`항목 ${i + 1}: ${result.error}`);
      } else {
        validGroups.push(parsed[i] as BookGroup);
      }
    }

    // 5. 검증 결과 반환
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `책 그룹 데이터 검증 실패: ${validationErrors.join(", ")}`,
      };
    }

    return { success: true, data: validGroups };
  } catch (error) {
    return {
      success: false,
      error: `JSON 파싱 실패: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * 책 그룹 배열을 안전하게 JSON 문자열로 직렬화합니다.
 *
 * @param groups 직렬화할 책 그룹 배열
 * @returns 직렬화 결과
 */
export function safeStringifyBookGroups(groups: BookGroup[]): {
  success: boolean;
  data?: string;
  error?: string;
} {
  try {
    // 각 그룹 검증
    const validationErrors: string[] = [];

    for (let i = 0; i < groups.length; i++) {
      const result = validateBookGroup(groups[i]);
      if (!result.valid) {
        validationErrors.push(`항목 ${i + 1}: ${result.error}`);
      }
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `책 그룹 데이터 검증 실패: ${validationErrors.join(", ")}`,
      };
    }

    // JSON 문자열로 변환
    const jsonString = JSON.stringify(groups);
    return { success: true, data: jsonString };
  } catch (error) {
    return {
      success: false,
      error: `JSON 직렬화 실패: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
