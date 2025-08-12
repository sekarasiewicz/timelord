export const msToHhMm = (ms: number): string => {
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours}h ${minutes}m`
}

export const toMonthISO = (d: Date = new Date()): string => d.toISOString().slice(0, 7)
