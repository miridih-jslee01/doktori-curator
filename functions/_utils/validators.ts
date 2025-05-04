/**
 * 데이터 검증을 위한 순수 유틸리티 모듈
 */

/**
 * 결과를 나타내는 제네릭 타입
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 검증 결과를 나타내는 인터페이스
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 성공 결과를 생성합니다.
 *
 * @param data 결과 데이터
 * @returns 성공 결과 객체
 */
export function success<T>(data: T): Result<T> {
  return {
    success: true,
    data,
  };
}

/**
 * 실패 결과를 생성합니다.
 *
 * @param error 오류 메시지
 * @returns 실패 결과 객체
 */
export function failure<T>(error: string): Result<T> {
  return {
    success: false,
    error,
  };
}

/**
 * 객체 배열을 안전하게 파싱합니다.
 *
 * @param jsonString 파싱할 JSON 문자열
 * @param validator 각 항목의 유효성 검사기
 * @returns 파싱 및 검증 결과
 */
export function safeParseArray<T>(
  jsonString: string,
  validator: (item: unknown) => ValidationResult,
): Result<T[]> {
  // 1. JSON 파싱 시도
  try {
    const parsed = JSON.parse(jsonString);

    // 2. 배열인지 확인
    if (!Array.isArray(parsed)) {
      return failure("JSON 데이터가 배열이 아닙니다.");
    }

    // 3. 빈 배열 확인
    if (parsed.length === 0) {
      return success([]);
    }

    // 4. 각 항목 검증
    const validationErrors: string[] = [];
    const validItems: T[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const result = validator(parsed[i]);
      if (!result.valid) {
        validationErrors.push(`항목 ${i + 1}: ${result.error}`);
      } else {
        validItems.push(parsed[i] as T);
      }
    }

    // 5. 검증 결과 반환
    if (validationErrors.length > 0) {
      return failure(`데이터 검증 실패: ${validationErrors.join(", ")}`);
    }

    return success(validItems);
  } catch (error) {
    return failure(
      `JSON 파싱 실패: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * 객체 배열을 안전하게 JSON 문자열로 직렬화합니다.
 *
 * @param items 직렬화할 객체 배열
 * @param validator 각 항목의 유효성 검사기
 * @returns 직렬화 결과
 */
export function safeStringifyArray<T>(
  items: T[],
  validator: (item: T) => ValidationResult,
): Result<string> {
  try {
    // 각 항목 검증
    const validationErrors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const result = validator(items[i]);
      if (!result.valid) {
        validationErrors.push(`항목 ${i + 1}: ${result.error}`);
      }
    }

    if (validationErrors.length > 0) {
      return failure(`데이터 검증 실패: ${validationErrors.join(", ")}`);
    }

    // JSON 문자열로 변환
    const jsonString = JSON.stringify(items);
    return success(jsonString);
  } catch (error) {
    return failure(
      `JSON 직렬화 실패: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
