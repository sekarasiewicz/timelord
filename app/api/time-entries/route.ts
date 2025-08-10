import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { manualEntrySchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = manualEntrySchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const task = await db.task.findFirst({ where: { id: parsed.data.taskId, project: { userId: session.user.id } } });
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });
  const start = new Date(parsed.data.startTime);
  const end = new Date(parsed.data.endTime);
  if (!(+end > +start)) return Response.json({ error: "end < start" }, { status: 400 });
  const created = await db.timeEntry.create({ data: { taskId: task.id, startTime: start, endTime: end, manual: true } });
  return Response.json({ id: created.id, taskId: created.taskId, startTime: created.startTime, endTime: created.endTime, manual: created.manual }, { status: 201 });
}


