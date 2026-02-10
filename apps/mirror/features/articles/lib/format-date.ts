const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatShortDate(dateString: string): string {
  return shortDateFormatter.format(new Date(dateString));
}

export function formatLongDate(dateString: string): string {
  return longDateFormatter.format(new Date(dateString));
}
