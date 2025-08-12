export const now = (): Date => new Date()
export const startOfMonth = (iso: string): Date => new Date(`${iso}-01T00:00:00Z`)
export const endOfMonth = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999))
export const durationMs = (start: Date, end: Date): number => Math.max(0, +end - +start)
