/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 내일 현재 시간을 계산하여 한국어 형식으로 포맷팅합니다.
 *
 * @returns 포맷팅된 날짜 문자열 (예: "2023년 10월 25일 오후 3:00")
 */
export function getTomorrowFormattedDate(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * 지정된 일수 후의 날짜를 계산하여 한국어 형식으로 포맷팅합니다.
 *
 * @param daysLater 현재로부터 몇 일 후인지 지정 (기본값: 1)
 * @returns 포맷팅된 날짜 문자열
 */
export function getFormattedDateAfterDays(daysLater: number = 1): string {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysLater);

  return targetDate.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
