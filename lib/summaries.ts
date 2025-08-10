import { db } from "./db";
import { startOfMonth, endOfMonth } from "./time";

export async function projectMonthTotalMs(userId: string, month: string, projectId: string): Promise<number> {
  const from = startOfMonth(month);
  const to = endOfMonth(from);
  const rows = await db.timeEntry.findMany({
    where: {
      task: { projectId, project: { userId } },
      OR: [
        { startTime: { gte: from, lte: to } },
        { endTime: { gte: from, lte: to } },
        { AND: [{ startTime: { lt: from } }, { endTime: { gt: to } }] },
      ],
    },
    select: { startTime: true, endTime: true },
  });
  return rows.reduce((acc, r) => {
    const s = new Date(Math.max(+r.startTime, +from));
    const e = new Date(Math.min(+(r.endTime ?? new Date()), +to));
    return acc + Math.max(0, +e - +s);
  }, 0);
}


