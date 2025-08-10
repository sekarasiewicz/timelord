import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stopSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { taskId } = stopSchema.parse(await req.json());
  const entry = await db.timeEntry.findFirst({ where: { taskId, endTime: null, task: { project: { userId: session.user.id } } } });
  if (!entry) return Response.json({ error: "No active entry" }, { status: 400 });
  const updated = await db.timeEntry.update({ where: { id: entry.id }, data: { endTime: new Date() } });
  return Response.json({ id: updated.id, startTime: updated.startTime, endTime: updated.endTime, taskId });
}


