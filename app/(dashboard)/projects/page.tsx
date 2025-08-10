import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectMonthTotalMs } from "@/lib/summaries";
import { msToHhMm, toMonthISO } from "@/lib/date";
import Link from "next/link";

export default async function ProjectsPage({ searchParams }: { searchParams: { status?: string; month?: string; search?: string } }) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  const status = (searchParams.status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE") as "ACTIVE" | "ARCHIVED";
  const month = searchParams.month ?? toMonthISO();
  const search = (searchParams.search ?? "").trim();

  const projects = await db.project.findMany({
    where: {
      userId,
      status,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const withTotals = await Promise.all(
    projects.map(async (p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      monthTotalMs: await projectMonthTotalMs(userId, month, p.id),
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <Link href={`?status=${status === "ACTIVE" ? "ARCHIVED" : "ACTIVE"}&month=${month}`} className="border px-3 py-1 rounded">
            {status === "ACTIVE" ? "Show Archived" : "Show Active"}
          </Link>
          <Link href={`/projects/new`} className="bg-blue-600 text-white px-3 py-1 rounded">New Project</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {withTotals.map((p) => (
          <div key={p.id} className="border rounded p-4">
            <div className="flex items-center gap-2">
              <Link href={`/projects/${p.id}`} className="font-medium text-lg">{p.name}</Link>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full border">{p.status}</span>
            </div>
            {p.description && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{p.description}</p>}
            <div className="text-sm mt-3">This month: <span className="font-medium">{msToHhMm(p.monthTotalMs)}</span></div>
          </div>
        ))}
        {withTotals.length === 0 && (
          <div className="text-sm text-neutral-600">No projects</div>
        )}
      </div>
    </div>
  );
}


