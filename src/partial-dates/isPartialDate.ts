// Whether text is a partial date (invariant 7): YYYY, YYYY-MM or YYYY-MM-DD, naming a real
// day of the proleptic Gregorian calendar between years 0001 and 9999.
const shape = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/u;
const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysIn(year: number, month: number): number {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return month === 2 && leap ? 29 : (monthLengths[month - 1] ?? 0);
}

export function isPartialDate(text: string): boolean {
  const match = shape.exec(text);
  if (match === null) return false;
  const year = Number(match[1]);
  const month = match[2] === undefined ? 1 : Number(match[2]);
  const day = match[3] === undefined ? 1 : Number(match[3]);
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= daysIn(year, month);
}
