export type BookGroup = {
  bookTitle: string;
  members: string[];
};

export const reassignmentGroups = (bookGroups: BookGroup[], min?: number) => {
  if (min) {
    return bookGroups.filter((bookGroup) => bookGroup.members.length >= min);
  }
  return bookGroups;
};
