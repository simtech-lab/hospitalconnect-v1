/** Shared date formatting for hospital events and the console. */

const longDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortMonth = new Intl.DateTimeFormat("en-GB", { month: "short" });

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatEventDate(timestamp: number) {
  return longDate.format(new Date(timestamp));
}

export function formatEventTime(timestamp: number) {
  return clock.format(new Date(timestamp));
}

export function formatEventDateRange(startsAt: number, endsAt?: number) {
  if (!endsAt) return formatEventDate(startsAt);
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  return sameDay
    ? formatEventDate(startsAt)
    : `${formatEventDate(startsAt)} – ${formatEventDate(endsAt)}`;
}

export function formatEventTimeRange(startsAt: number, endsAt?: number) {
  if (!endsAt) return formatEventTime(startsAt);
  return `${formatEventTime(startsAt)} – ${formatEventTime(endsAt)}`;
}

export function eventDateParts(timestamp: number) {
  const date = new Date(timestamp);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: shortMonth.format(date).toUpperCase(),
  };
}

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Convert epoch ms to the value expected by <input type="datetime-local">. */
export function toDateTimeLocal(timestamp: number) {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse a datetime-local value, returning null when it is empty or invalid. */
export function fromDateTimeLocal(value: string) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}
