import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { projectCreateSchema } from '@/lib/validators'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(projects)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = projectCreateSchema.safeParse(await req.json())
  if (!body.success) return Response.json({ error: body.error.flatten() }, { status: 400 })
  const created = await db.project.create({
    data: {
      userId: session.user.id,
      name: body.data.name,
      description: body.data.description,
    },
  })
  return Response.json(created, { status: 201 })
}
