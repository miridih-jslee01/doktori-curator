/**
 * 순수 배열 유틸리티 함수 모음
 * 이 모듈은 애플리케이션 로직에 독립적인 순수 함수만 포함합니다.
 */

/**
 * Fisher-Yates 알고리즘을 사용하여 배열을 무작위로 섞습니다.
 * 원본 배열을 변경하지 않고 새 배열을 반환합니다.
 *
 * @param array 섞을 배열
 * @returns 섞인 새 배열
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 배열을 지정된 크기의 청크로 나눕니다.
 *
 * @param array 나눌 배열
 * @param chunkSize 청크 크기
 * @returns 청크 배열의 배열
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
