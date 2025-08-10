import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { taskUpdateSchema } from "@/lib/validators";

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = taskUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const existing = await db.task.findFirst({ where: { id: params.taskId, project: { userId: session.user.id } } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  const updated = await db.task.update({ where: { id: existing.id }, data: parsed.data });
  return Response.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { taskId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await db.task.findFirst({ where: { id: params.taskId, project: { userId: session.user.id } } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
  await db.task.delete({ where: { id: existing.id } });
  return Response.json({ ok: true });
}


