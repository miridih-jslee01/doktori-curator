export type BookGroup = {
  bookTitle: string;
  members: string[];
};

const pick = <T>(array: T[], index: number) => array.splice(index, 1)[0];
const getRandomIdx = (array: unknown[]): number =>
  Math.floor(Math.random() * array.length);
const pickRandomElement = <T>(array: T[]) => pick(array, getRandomIdx(array));
const getSecondLowestLengthElementIdx = <T>(
  array: T[],
  lowestLengthElementIdx: number,
  getLength: (el: T) => number,
) => {
  const arrayWithoutLowestElement = [...array];
  pick(arrayWithoutLowestElement, lowestLengthElementIdx);
  const lengthArrayWithoutLowestLength = arrayWithoutLowestElement.map(
    getLength,
  );

  const secondLowestLength = Math.min(...lengthArrayWithoutLowestLength);

  return array.findIndex(
    (el, idx) =>
      idx !== lowestLengthElementIdx && getLength(el) === secondLowestLength,
  );
};

const findMultipleIdxes = <T>(
  array: T[],
  isFindingEl: (el: T) => boolean,
  foundIdxes?: number[],
) => {
  if (foundIdxes) {
    const firstElementIdx = array.findIndex(
      (el, idx) => !foundIdxes.includes(idx) && isFindingEl(el),
    );
    if (firstElementIdx === -1) {
      return foundIdxes;
    } else {
      return findMultipleIdxes(array, isFindingEl, [
        ...foundIdxes,
        firstElementIdx,
      ]);
    }
  } else {
    const firstElementIdx = array.findIndex(isFindingEl);
    return findMultipleIdxes(array, isFindingEl, [firstElementIdx]);
  }
};

export const reassignmentGroups = (
  bookGroups: BookGroup[],
  min = 1,
  max?: number,
): BookGroup[] => {
  if (bookGroups.length === 1) {
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

  if (minBookGroupLength >= min && !(max && maxBookGroupLength > max)) {
    return nextBookGroups;
  }

  const minBookGroupIdxes = findMultipleIdxes(
    bookGroups,
    (group) => group.members.length === minBookGroupLength,
  );
  const minBookGroupIdx = minBookGroupIdxes[getRandomIdx(minBookGroupIdxes)];
  const maxBookGroupIdx = bookGroups.findIndex(
    (group) => group.members.length === maxBookGroupLength,
  );

  if (totalSparePerson >= 0) {
    const sparePerson = pickRandomElement(
      nextBookGroups[maxBookGroupIdx].members,
    );
    nextBookGroups[minBookGroupIdx].members.push(sparePerson);
  } else {
    const secondMinBookGroupIdx = getSecondLowestLengthElementIdx(
      nextBookGroups,
      minBookGroupIdx,
      (bookGroup) => bookGroup.members.length,
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
