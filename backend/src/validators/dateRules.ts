// Shared by project/task validators — "today" compared by calendar day (not
// exact time), so picking today's date still passes regardless of the
// current time of day.
const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const isNotPastDate = (date: Date) => date >= startOfToday();

export const PAST_DATE_MESSAGE = 'Date cannot be in the past';
