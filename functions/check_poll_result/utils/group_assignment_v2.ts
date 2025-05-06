export type BookGroup = {
  bookTitle: string;
  members: string[];
};

const pick = <T>(array: T[], index: number) => array.splice(index, 1)[0];
const getRandomIdx = (array: unknown[]): number =>
  Math.floor(Math.random() * array.length);

export const reassignmentGroups = (
  bookGroups: BookGroup[],
  min?: number,
): BookGroup[] => {
  if (!min) {
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
    const sparePerson = pick(
      nextBookGroups[maxBookGroupIdx].members,
      getRandomIdx(nextBookGroups[maxBookGroupIdx].members),
    );
    nextBookGroups[minBookGroupIdx].members.push(sparePerson);

    return reassignmentGroups(nextBookGroups, min);
  }

  return nextBookGroups.filter((bookGroup) => bookGroup.members.length >= min);
};
