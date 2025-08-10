import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startSchema } from "@/lib/validators";
import { now } from "@/lib/time";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = startSchema.parse(await req.json());
  const userId = session.user.id;

  // Close any active entry for this user
  await db.timeEntry.updateMany({
    where: { endTime: null, task: { project: { userId } } },
    data: { endTime: now() },
  });

  // Ensure task belongs to user
  const task = await db.task.findFirst({ where: { id: body.taskId, project: { userId } } });
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });

  const entry = await db.timeEntry.create({ data: { taskId: body.taskId, startTime: now() } });
  return Response.json({ id: entry.id, startTime: entry.startTime, taskId: entry.taskId, manual: false });
}


