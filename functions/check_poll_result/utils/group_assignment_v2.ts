export type BookGroup = {
  bookTitle: string;
  members: string[];
};

const pick = <T>(array: T[], index: number) => {
  if (array.length > 0) {
    return array.splice(index, 1)[0];
  }
};
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

  return findIndex(
    array,
    (el, idx) =>
      idx !== lowestLengthElementIdx && getLength(el) === secondLowestLength,
  );
};

const findMultipleIdxes = <T>(
  array: T[],
  isFindingEl: (el: T, idx: number) => boolean,
  foundIdxes?: number[],
) => {
  if (foundIdxes) {
    const firstElementIdx = array.findIndex(
      (el, idx) => !foundIdxes.includes(idx) && isFindingEl(el, idx),
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

const findIndex = <T>(
  array: T[],
  isFindingEl: (el: T, idx: number) => boolean,
) => {
  const foundIdxes = findMultipleIdxes(array, isFindingEl);
  return foundIdxes[getRandomIdx(foundIdxes)];
};

type MemberBookSelections = Map<string, string[]>;
type MemberBookAssignment = Map<string, string>;

const getMemberBookSelections = (bookGroups: BookGroup[]) => {
  const memberBookSelections: MemberBookSelections = new Map();

  bookGroups.forEach((group) => {
    group.members.forEach((member) => {
      const currentBookSelections = memberBookSelections.get(member);
      memberBookSelections.set(
        member,
        currentBookSelections
          ? [...currentBookSelections, group.bookTitle]
          : [group.bookTitle],
      );
    });
  });

  return memberBookSelections;
};

const getMemberBookAssignment = (
  memberBookSelections: MemberBookSelections,
) => {
  const memberBookAssignment: MemberBookAssignment = new Map<string, string>();

  memberBookSelections.forEach((value, key) => {
    const pickedElement = pickRandomElement(value);
    if (pickedElement) {
      memberBookAssignment.set(key, pickedElement);
    }
  });

  return memberBookAssignment;
};

const initializeBookGroupsMembers = (
  bookGroups: BookGroup[],
  memberBookAssignment: MemberBookAssignment,
) => {
  bookGroups.forEach(
    (group) => (group.members = group.members.filter(
      (member) => memberBookAssignment.get(member) === group.bookTitle,
    )),
  );
};

export const reassignmentGroups = (
  bookGroups: BookGroup[],
  min = 1,
  max?: number,
): BookGroup[] => {
  if (bookGroups.length === 1) {
    return bookGroups;
  }
  const nextBookGroups = [...bookGroups];
  const memberBookSelections = getMemberBookSelections(bookGroups);
  const memberBookAssignment = getMemberBookAssignment(memberBookSelections);
  initializeBookGroupsMembers(nextBookGroups, memberBookAssignment);

  const bookGroupMembersLengths = nextBookGroups.map(
    (group) => group.members.length,
  );
  const sparePersonArray = nextBookGroups.map(
    (group) => group.members.length - min,
  );
  const totalSparePerson = sparePersonArray.reduce((a, b) => a + b, 0);

  const minBookGroupLength = Math.min(...bookGroupMembersLengths);
  const maxBookGroupLength = Math.max(...bookGroupMembersLengths);

  if (minBookGroupLength >= min && !(max && maxBookGroupLength > max)) {
    return nextBookGroups;
  }

  const minBookGroupIdx = findIndex(
    nextBookGroups,
    (group) => group.members.length === minBookGroupLength,
  );
  const maxBookGroupIdx = findIndex(
    nextBookGroups,
    (group) => group.members.length === maxBookGroupLength,
  );

  if (totalSparePerson >= 0) {
    const sparePerson = pickRandomElement(
      nextBookGroups[maxBookGroupIdx].members,
    );
    if (sparePerson) {
      nextBookGroups[minBookGroupIdx].members.push(sparePerson);
    }
  } else {
    const secondMinBookGroupIdx = getSecondLowestLengthElementIdx(
      nextBookGroups,
      minBookGroupIdx,
      (bookGroup) => bookGroup.members.length,
    );
    const sparePerson = pickRandomElement(
      nextBookGroups[minBookGroupIdx].members,
    );
    if (sparePerson) {
      nextBookGroups[secondMinBookGroupIdx].members.push(sparePerson);
    }
  }

  return reassignmentGroups(
    nextBookGroups.filter((group) => group.members.length > 0),
    min,
  );
};
