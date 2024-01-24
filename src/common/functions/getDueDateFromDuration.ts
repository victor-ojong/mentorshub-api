export type IDuration = `${number}d` | `${number}w` | `${number}m`;

export const convertDurationToDays = (duration: IDuration): number => {
  let durationNumber = parseInt(duration.slice(0, duration.length - 1));
  const durationType = duration.slice(-1);

  switch (durationType) {
    case 'w':
      durationNumber = durationNumber * 7;
      break;
    case 'm':
      durationNumber = durationNumber * 4 * 7;
      break;
    default:
      break;
  }

  return durationNumber;
};

export const getDueDatesFromDuration = (duration: IDuration) => {
  const durationInDays = convertDurationToDays(duration);

  // Get the current UTC date
  const currentDate = new Date();

  // Add durationInDays days to the current UTC date
  const futureDate = new Date(currentDate);
  return new Date(
    futureDate.setUTCDate(currentDate.getUTCDate() + durationInDays)
  );
};

export const getDuedateFromDays = ({
  days,
  dueDate,
  isAdd = true,
}: {
  days: number;
  dueDate: Date;
  isAdd?: boolean;
}) => {
  // Get the current UTC date
  const currentDate = new Date(dueDate);

  // subtract durationInDays days to the current UTC date
  const futureDate = new Date(currentDate);
  return !isAdd
    ? new Date(futureDate.setUTCDate(currentDate.getUTCDate() + days))
    : new Date(futureDate.setUTCDate(currentDate.getUTCDate() - days));
};
