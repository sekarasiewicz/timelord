import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { msToHhMm, toMonthISO } from '@/lib/date'
import { db } from '@/lib/db'
import { endOfMonth, startOfMonth } from '@/lib/time'
import TaskListClient from './TaskListClient'

export default async function ProjectDetail({
  params,
  searchParams,
}: {
  params: { projectId: string }
  searchParams: { month?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')
  const userId = session.user.id
  const month = searchParams.month ?? toMonthISO()
  const from = startOfMonth(month)
  const to = endOfMonth(from)

  const project = await db.project.findFirst({
    where: { id: params.projectId, userId },
  })
  if (!project) return <div className="text-sm text-red-600">Not found</div>

  const tasks = await db.task.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: 'desc' },
  })
  const taskWithTotals = await Promise.all(
    tasks.map(async (t) => {
      const entries = await db.timeEntry.findMany({
        where: {
          taskId: t.id,
          OR: [
            { startTime: { gte: from, lte: to } },
            { endTime: { gte: from, lte: to } },
            { AND: [{ startTime: { lt: from } }, { endTime: { gt: to } }] },
          ],
        },
        select: { startTime: true, endTime: true },
      })
      const monthTotal = entries.reduce((acc, r) => {
        const s = new Date(Math.max(+r.startTime, +from))
        const e = new Date(Math.min(+(r.endTime ?? new Date()), +to))
        return acc + Math.max(0, +e - +s)
      }, 0)

      const active = await db.timeEntry.findFirst({
        where: { taskId: t.id, endTime: null },
      })
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        monthTotalMs: monthTotal,
        activeEntry: active ? { id: active.id, startTime: active.startTime.toISOString() } : undefined,
      }
    }),
  )

  const totalMonth = taskWithTotals.reduce((acc, t) => acc + t.monthTotalMs, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <span className="ml-auto text-sm">
          This month: <span className="font-medium">{msToHhMm(totalMonth)}</span>
        </span>
        <Link href="/projects" className="text-sm border px-3 py-1 rounded">
          Back
        </Link>
      </div>
      <TaskListClient
        projectId={project.id}
        tasks={taskWithTotals.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          monthTotalMs: t.monthTotalMs,
          activeEntry: t.activeEntry,
        }))}
      />
    </div>
  )
}
