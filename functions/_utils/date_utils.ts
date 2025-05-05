/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 내일 현재 시간을 계산하여 한국어 형식으로 포맷팅합니다.
 * 서버 시간에 관계없이 한국 시간대(UTC+9)를 기준으로 계산합니다.
 *
 * @returns 포맷팅된 날짜 문자열 (예: "2023년 10월 25일 오후 3:00")
 */
export function getTomorrowFormattedDate(): string {
  // 현재 시간을 가져와서 한국 시간대로 조정 (UTC+9)
  const now = new Date();
  const koreaTimeOffset = 9 * 60; // 한국 시간은 UTC+9
  const utcOffset = now.getTimezoneOffset(); // 현재 시스템 시간대와 UTC의 차이(분)
  const totalOffset = koreaTimeOffset + utcOffset; // 현재 시스템에서 한국 시간으로의 조정값(분)

  now.setMinutes(now.getMinutes() + totalOffset);

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
 * 서버 시간에 관계없이 한국 시간대(UTC+9)를 기준으로 계산합니다.
 * 예: 한국 시간 오후 2:38에 이 함수를 실행하면, 다음날 오후 2:38로 계산됩니다.
 *
 * @param daysLater 현재로부터 몇 일 후인지 지정 (기본값: 1)
 * @returns 포맷팅된 날짜 문자열 (예: "2023년 10월 25일 오후 3:00")
 */
export function getFormattedDateAfterDays(daysLater: number = 1): string {
  // 현재 시간을 가져와서 한국 시간대로 조정 (UTC+9)
  const now = new Date();
  const koreaTimeOffset = 9 * 60; // 한국 시간은 UTC+9
  const utcOffset = now.getTimezoneOffset(); // 현재 시스템 시간대와 UTC의 차이(분)
  const totalOffset = koreaTimeOffset + utcOffset; // 현재 시스템에서 한국 시간으로의 조정값(분)

  now.setMinutes(now.getMinutes() + totalOffset);

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
