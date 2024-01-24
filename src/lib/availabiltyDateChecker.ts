export type Availability = {
  date: string;
  time: string[] | string;
};

export type RequestedDate = {
  date: string;
  time: string;
};

export const availabilityDateCheckerPath = (dates: Availability[]) => {
  const currentDate = new Date();
  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };
  const isNotPastDate = (dateString: string) => {
    const date = new Date(dateString);
    return date >= currentDate;
  };
  const isNotPastTime = (timeString: string, dateString: string) => {
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) {
      return false;
    }
    const [year, month, day] = dateParts.map((part) => parseInt(part));
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return false;
    }
    const timeParts = timeString.split(':');
    if (timeParts.length !== 2) {
      return false;
    }

    const [hours, minutes] = timeParts.map((part) => parseInt(part));
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    const dateTime = new Date(year, month - 1, day, hours, minutes, 0);
    return dateTime >= currentDate;
  };
  const validateTime = (time: string | string[], date: string) => {
    if (Array.isArray(time)) {
      return time.every((time) => isNotPastTime(time, date));
    }
    return isNotPastTime(time, date);
  };

  return dates.every((date) => {
    console.log(validateTime(date.time, date.date), 'The date values');
    return (
      isValidDate(date.date) &&
      isNotPastDate(date.date) &&
      validateTime(date.time, date.date)
    );
  });
};

export const isAvailable = (
  requestedDateTimeArray: RequestedDate[],
  mentorAvailability: Availability[]
) => {
  for (const requestedDateTime of requestedDateTimeArray) {
    const { date, time } = requestedDateTime;
    const matchingSlot = mentorAvailability.find(
      (slot) => slot.date === date && slot.time.includes(time)
    );
    if (!matchingSlot) {
      return false;
    }
  }
  return true;
};
