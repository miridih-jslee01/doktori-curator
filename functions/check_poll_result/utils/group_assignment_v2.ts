export type BookGroup = {
  bookTitle: string;
  members: string[];
};

const pick = (array: string[], index: number) => array.splice(index, 1)[0];

export const reassignmentGroups = (bookGroups: BookGroup[], min?: number) => {
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

  const minBookGroupIdx = bookGroups.findIndex(
    (group) => group.members.length === Math.min(...bookGroupMembersLengths),
  );
  const maxBookGroupIdx = bookGroups.findIndex(
    (group) => group.members.length === Math.max(...bookGroupMembersLengths),
  );

  if (totalSparePerson >= 0) {
    const sparePerson = pick(
      nextBookGroups[maxBookGroupIdx].members,
      Math.floor(
        Math.random() * nextBookGroups[maxBookGroupIdx].members.length,
      ),
    );
    nextBookGroups[minBookGroupIdx].members.push(sparePerson);
  }

  return nextBookGroups.filter((bookGroup) => bookGroup.members.length >= min);
};
