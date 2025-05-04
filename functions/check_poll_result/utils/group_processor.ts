/**
 * 그룹 처리 및 정렬을 담당하는 유틸리티 모듈
 */
import { BookGroup } from "./types.ts";

/**
 * 처리된 그룹 정보와 메시지
 */
export interface ProcessedGroupResult {
  sortedGroups: BookGroup[];
  sortedMessages: string[];
  totalParticipants: number;
}

/**
 * 그룹과 메시지를 필터링하고 정렬합니다.
 *
 * @param bookGroups 모든 책 그룹 배열
 * @param messages 그룹에 대응하는 메시지 배열
 * @returns 필터링 및 정렬된 그룹과 메시지
 */
export function processGroupsAndMessages(
  bookGroups: BookGroup[],
  messages: string[],
): ProcessedGroupResult {
  // 멤버가 있는 그룹만 필터링
  const filledGroups = bookGroups.filter((group) => group.members.length > 0);

  // 책 인덱스 순서대로 정렬
  filledGroups.sort((a, b) => a.bookIndex - b.bookIndex);

  // 정렬된 그룹에 맞춰 메시지도 정렬
  const sortedMessages = filledGroups.map((group) => {
    const originalIndex = bookGroups.findIndex(
      (originalGroup) => originalGroup.bookIndex === group.bookIndex,
    );
    return messages[originalIndex];
  });

  // 총 참여 인원수 계산
  const totalParticipants = filledGroups.reduce(
    (sum, group) => sum + group.members.length,
    0,
  );

  return {
    sortedGroups: filledGroups,
    sortedMessages,
    totalParticipants,
  };
}

/**
 * 특정 그룹에 대해 지정된 기준으로 멤버를 정렬합니다.
 *
 * @param group 정렬할 멤버가 있는 그룹
 * @param sortOrder 정렬 방식 ('random', 'alphabetical', 'none')
 * @returns 멤버가 정렬된 새 그룹 객체
 */
export function sortGroupMembers(
  group: BookGroup,
  sortOrder: "random" | "alphabetical" | "none" = "none",
): BookGroup {
  if (!group.members || group.members.length <= 1 || sortOrder === "none") {
    return { ...group };
  }

  const sortedMembers = [...group.members];

  if (sortOrder === "random") {
    // 무작위 정렬
    for (let i = sortedMembers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sortedMembers[i], sortedMembers[j]] = [
        sortedMembers[j],
        sortedMembers[i],
      ];
    }
  } else if (sortOrder === "alphabetical") {
    // 알파벳 순 정렬
    sortedMembers.sort();
  }

  return {
    ...group,
    members: sortedMembers,
  };
}
