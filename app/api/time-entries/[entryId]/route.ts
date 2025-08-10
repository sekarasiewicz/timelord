import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { entryPatchSchema } from "@/lib/validators";

export async function PATCH(req: Request, { params }: { params: { entryId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = entryPatchSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const entry = await db.timeEntry.findFirst({ where: { id: params.entryId, task: { project: { userId: session.user.id } } } });
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  const updated = await db.timeEntry.update({
    where: { id: entry.id },
    data: {
      ...(parsed.data.startTime ? { startTime: new Date(parsed.data.startTime) } : {}),
      ...(parsed.data.endTime ? { endTime: new Date(parsed.data.endTime) } : {}),
    },
  });
  return Response.json({ id: updated.id, taskId: updated.taskId, startTime: updated.startTime, endTime: updated.endTime, manual: updated.manual });
}

export async function DELETE(_req: Request, { params }: { params: { entryId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const entry = await db.timeEntry.findFirst({ where: { id: params.entryId, task: { project: { userId: session.user.id } } } });
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  await db.timeEntry.delete({ where: { id: entry.id } });
  return Response.json({ ok: true });
}


