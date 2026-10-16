export function toBengaliNumber(num: number): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (digit) => bnDigits[Number(digit)] ?? digit);
}

/**
 * Completed months since a start point, rounding up when at least half of the
 * current month has passed. `startMonth` is 0-indexed (0 = January).
 */
export function calculateMonthsSince(startYear: number, startMonth: number, now: Date = new Date()): number {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const fullMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isHalfOrMore = currentDate >= daysInCurrentMonth / 2;
  const additionalMonth = isHalfOrMore ? 1 : 0;

  return Math.max(0, fullMonths + additionalMonth);
}

export function formatExperienceDuration(totalMonths: number, isBn: boolean): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (isBn) {
    if (years === 0) {
      return `${toBengaliNumber(months)} মাস +`;
    }
    if (months === 0) {
      return `${toBengaliNumber(years)} বছর +`;
    }
    return `${toBengaliNumber(years)} বছর ${toBengaliNumber(months)} মাস +`;
  }

  if (years === 0) {
    const monthText = months === 1 ? "1 Month" : `${months} Months`;
    return `${monthText} +`;
  }

  const yearText = years === 1 ? "1 Year" : `${years} Years`;
  if (months === 0) {
    return `${yearText} +`;
  }

  const monthText = months === 1 ? "1 Month" : `${months} Months`;
  return `${yearText} ${monthText} +`;
}
