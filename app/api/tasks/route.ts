import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { taskCreateSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const tasks = await db.task.findMany({ where: { projectId: projectId ?? undefined, project: { userId: session.user.id } }, orderBy: { createdAt: "desc" } });
  return Response.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = taskCreateSchema.safeParse(await req.json());
  if (!body.success) return Response.json({ error: body.error.flatten() }, { status: 400 });
  const project = await db.project.findFirst({ where: { id: body.data.projectId, userId: session.user.id } });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  const created = await db.task.create({ data: { projectId: project.id, name: body.data.name, description: body.data.description } });
  return Response.json(created, { status: 201 });
}


