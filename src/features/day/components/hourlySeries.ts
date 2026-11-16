export type HourlySeries = { hours: readonly number[]; counts: readonly number[] }

export function alignedPoints({ hours, counts }: HourlySeries) {
  return hours.slice(0, Math.min(hours.length, counts.length)).map((hour, index) => ({
    hour,
    count: Math.max(0, counts[index] ?? 0),
  }))
}
