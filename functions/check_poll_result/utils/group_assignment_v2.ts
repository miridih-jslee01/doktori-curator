export type BookGroup = {
  bookTitle: string;
  members: string[];
};

const pick = <T>(array: T[], index: number) => array.splice(index, 1)[0];
const getRandomIdx = (array: unknown[]): number =>
  Math.floor(Math.random() * array.length);
const pickRandomElement = <T>(array: T[]) => pick(array, getRandomIdx(array));
const getSecondMinBookGroupIdx = <T extends { members: string[] }>(
  array: T[],
  minBookGroupIdx: number,
) => {
  const arrayWithoutMinElement = [...array];
  pick(arrayWithoutMinElement, minBookGroupIdx);
  const membersLengthWithoutLowestMembersLength = arrayWithoutMinElement.map(
    (el) => el.members.length,
  );

  const secondMinMembersLength = Math.min(
    ...membersLengthWithoutLowestMembersLength,
  );

  return array.findIndex(
    (array, idx) =>
      idx !== minBookGroupIdx &&
      array.members.length === secondMinMembersLength,
  );
};

export const reassignmentGroups = (
  bookGroups: BookGroup[],
  min?: number,
): BookGroup[] => {
  if (!min || bookGroups.length === 1) {
    return bookGroups;
  }
  const bookGroupMembersLengths = bookGroups.map(
    (group) => group.members.length,
  );
  const sparePersonArray = bookGroups.map(
    (group) => group.members.length - min,
  );
  const totalSparePerson = sparePersonArray.reduce((a, b) => a + b, 0);
  const nextBookGroups = [...bookGroups];

  const minBookGroupLength = Math.min(...bookGroupMembersLengths);
  const maxBookGroupLength = Math.max(...bookGroupMembersLengths);

  if (minBookGroupLength >= min) {
    return nextBookGroups;
  }

  const minBookGroupIdx = bookGroups.findIndex(
    (group) => group.members.length === minBookGroupLength,
  );
  const maxBookGroupIdx = bookGroups.findIndex(
    (group) => group.members.length === maxBookGroupLength,
  );

  if (totalSparePerson >= 0) {
    const sparePerson = pickRandomElement(
      nextBookGroups[maxBookGroupIdx].members,
    );
    nextBookGroups[minBookGroupIdx].members.push(sparePerson);
  } else {
    const secondMinBookGroupIdx = getSecondMinBookGroupIdx(
      nextBookGroups,
      minBookGroupIdx,
    );
    const sparePerson = pickRandomElement(
      nextBookGroups[minBookGroupIdx].members,
    );
    nextBookGroups[secondMinBookGroupIdx].members.push(sparePerson);
  }

  return reassignmentGroups(
    nextBookGroups.filter((group) => group.members.length > 0),
    min,
  );
};
