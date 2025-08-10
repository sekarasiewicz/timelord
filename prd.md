Here’s your PRD, structured for clarity and completeness so Cursor (or any LLM) can turn it into an implementation plan.

⸻

Product Requirements Document (PRD)

Project Name: ChronoTrack (placeholder)
Type: Time Tracking Web Application
Tech Stack:
	•	Frontend & Backend: Next.js (App Router)
	•	Language: TypeScript
	•	Styling: Tailwind CSS
	•	Hosting: Vercel
	•	Auth: GitHub OAuth (via NextAuth.js)
	•	Database: PostgreSQL (via Prisma ORM)

⸻

1. Goal

Build a simple, intuitive, and responsive time tracking application with GitHub authentication, allowing users to manage projects, track tasks, and view time summaries.

⸻

2. User Roles
	•	Authenticated User – Can create, edit, archive, and delete projects, manage tasks, track time, and view reports.
	•	(Optional Future) Admin role for managing multiple users/projects.

⸻

3. Core Features

3.1 Authentication
	•	Login/Sign-up via GitHub OAuth (NextAuth.js).
	•	Logout option.
	•	Only authenticated users can access the dashboard.

⸻

3.2 Dashboard (Project List)
	•	Display: List of all projects with:
	•	Project name
	•	Status: Active / Archived
	•	Total hours tracked in the current month
	•	Actions:
	•	Add new project (modal form with name required, description optional).
	•	Edit project name.
	•	Delete project (hard delete).
	•	Archive/unarchive project.
	•	Search/filter projects by name/status.

⸻

3.3 Project Detail View
	•	Header:
	•	Project name & edit button.
	•	Total hours tracked in current month.
	•	Tasks Section:
	•	Each task has:
	•	Required name.
	•	Optional description.
	•	Play/Pause button to start/stop timer.
	•	Total time tracked.
	•	Manual time addition form (hours + minutes).
	•	Actions:
	•	Add new task (modal or inline form).
	•	Edit task name/description.
	•	Delete task.
	•	Timer Functionality:
	•	Only one task can be actively tracked at a time per user.
	•	On “Play” → store start time in DB.
	•	On “Pause” → calculate elapsed time, add to total.
	•	Browser refresh should not break the timer state (restore from DB).

⸻

3.4 Time Summary / Reporting
	•	Per project: total hours by month.
	•	Per task: total hours by month.
	•	Monthly breakdown with:
	•	Total hours worked.
	•	Number of tasks worked on.
	•	Export to CSV (future enhancement).

⸻

4. Data Model (Initial Proposal)

User
	•	id (string, PK)
	•	name (string)
	•	email (string)
	•	githubId (string)
	•	createdAt (DateTime)

Project
	•	id (string, PK)
	•	userId (FK to User)
	•	name (string, required)
	•	description (string, optional)
	•	status (enum: active, archived)
	•	createdAt (DateTime)

Task
	•	id (string, PK)
	•	projectId (FK to Project)
	•	name (string, required)
	•	description (string, optional)
	•	createdAt (DateTime)

TimeEntry
	•	id (string, PK)
	•	taskId (FK to Task)
	•	startTime (DateTime)
	•	endTime (DateTime, nullable if active)
	•	manual (boolean, default false)
	•	createdAt (DateTime)

⸻

5. Non-Functional Requirements
	•	Performance: Page loads < 1s on modern devices.
	•	Responsive Design: Fully functional on mobile and desktop.
	•	Persistence: All data stored in PostgreSQL (Prisma for schema).
	•	Deployment: Hosted on Vercel with automatic builds from main.

⸻

6. Missing/Extra Features Added
	•	Timer persistence across refresh/re-login.
	•	Search/filter in project list.
	•	Task-level and project-level monthly summaries.
	•	Archiving instead of only deletion for projects.
	•	Manual time entry for flexibility.

⸻

7. Future Enhancements (Not in initial scope)
	•	Multi-user project collaboration.
	•	Tags/categories for tasks.
	•	Weekly summary emails.
	•	Export reports in CSV/PDF.

Got it. Here’s an implementation-ready breakdown you can hand to Cursor.

Project Skeleton

/app
  /(auth)
    /signin/page.tsx
  /(dashboard)
    /projects/page.tsx
    /projects/[projectId]/page.tsx
  /api
    /auth/[...nextauth]/route.ts
    /projects/route.ts
    /projects/[projectId]/route.ts
    /tasks/route.ts
    /tasks/[taskId]/route.ts
    /time-entries/route.ts
    /time-entries/[entryId]/route.ts
  /layout.tsx
  /page.tsx               // redirect to /projects
/components
  ProjectCard.tsx
  ProjectForm.tsx
  ProjectToolbar.tsx
  TaskRow.tsx
  TaskForm.tsx
  TimerButton.tsx
  MonthSelector.tsx
  Stat.tsx
  Table.tsx
/lib
  auth.ts
  db.ts
  time.ts
  validators.ts
  errors.ts
  date.ts
  summaries.ts
/middleware.ts
/prisma/schema.prisma
/tailwind.config.ts
/env.d.ts

Env Vars

DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_ID=
GITHUB_SECRET=

Data Model (Prisma)

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  image     String?
  accounts  Account[]
  sessions  Session[]
  projects  Project[]
  createdAt DateTime @default(now())
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  tasks       Task[]
  @@index([userId, status])
}

enum ProjectStatus { ACTIVE ARCHIVED }

model Task {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  name        String
  description String?
  createdAt   DateTime @default(now())
  timeEntries TimeEntry[]
  @@index([projectId])
}

model TimeEntry {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id])
  startTime DateTime
  endTime   DateTime?
  manual    Boolean  @default(false)
  createdAt DateTime @default(now())
  @@index([taskId, startTime, endTime])
}

/* NextAuth base models (if using Prisma adapter) */
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

Auth (NextAuth + GitHub)

/lib/auth.ts

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [GitHub],
  pages: { signIn: "/signin" }
});

/app/api/auth/[...nextauth]/route.ts

export { handlers as GET, handlers as POST } from "@/lib/auth";

/middleware.ts (protect dashboard)

export { default } from "next-auth/middleware";
export const config = { matcher: ["/projects/:path*"] };

Routing & Navigation
	•	/ → server redirect to /projects.
	•	/signin → GitHub sign-in.
	•	/projects → list, create, edit inline, archive/unarchive, delete.
	•	/projects/[projectId] → tasks CRUD, play/pause, manual add, monthly summary.

Server Contracts (Route Handlers)

All routes require auth; use const session = await auth() and check session?.user.id.

Projects

POST /api/projects

// body: { name: string; description?: string }

GET /api/projects?status=ACTIVE|ARCHIVED&month=YYYY-MM

// returns projects with monthTotalMs

PATCH /api/projects/[projectId]

// body: { name?: string; description?: string; status?: 'ACTIVE'|'ARCHIVED' }

DELETE /api/projects/[projectId]

Tasks

POST /api/tasks

// body: { projectId: string; name: string; description?: string }

GET /api/tasks?projectId=...&month=YYYY-MM

// returns tasks with monthTotalMs and activeEntry if exists

PATCH /api/tasks/[taskId]

// body: { name?: string; description?: string }

DELETE /api/tasks/[taskId]

Time Entries

POST /api/time-entries (manual add)

// body: { taskId: string; startTime: string; endTime: string; manual: true }

POST /api/time-entries/start

// body: { taskId: string }
// closes any other active entry for this user before creating a new one

POST /api/time-entries/stop

// body: { taskId: string }
// finds active entry for taskId and sets endTime=now

PATCH /api/time-entries/[entryId]

// body: { startTime?: string; endTime?: string } // allow corrections

DELETE /api/time-entries/[entryId]

Shared Response Shapes (TS)

export type ProjectDTO = {
  id: string; name: string; description?: string | null;
  status: "ACTIVE"|"ARCHIVED"; monthTotalMs: number; createdAt: string;
};
export type TaskDTO = {
  id: string; name: string; description?: string | null;
  totalMs: number; monthTotalMs: number; activeEntry?: { id: string; startTime: string };
};
export type TimeEntryDTO = {
  id: string; taskId: string; startTime: string; endTime?: string | null; manual: boolean;
};

Server Utilities

/lib/db.ts

import { PrismaClient } from "@prisma/client";
export const db = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

/lib/time.ts

export const now = () => new Date();
export const startOfMonth = (iso: string) => new Date(iso + "-01T00:00:00Z");
export const endOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0, 23,59,59,999));
export const durationMs = (start: Date, end: Date) => Math.max(0, +end - +start);

/lib/summaries.ts

import { db } from "./db";
import { startOfMonth, endOfMonth } from "./time";

export async function projectMonthTotalMs(userId: string, month: string, projectId: string) {
  const from = startOfMonth(month);
  const to = endOfMonth(from);
  const rows = await db.timeEntry.findMany({
    where: { task: { projectId, project: { userId }}, OR:[
      { startTime: { gte: from, lte: to }},
      { endTime:   { gte: from, lte: to }},
      { AND: [{ startTime: { lt: from }}, { endTime: { gt: to }}] }
    ]},
    select: { startTime: true, endTime: true }
  });
  return rows.reduce((acc, r) => {
    const s = new Date(Math.max(+r.startTime, +from));
    const e = new Date(Math.min(+(r.endTime ?? new Date()), +to));
    return acc + Math.max(0, +e - +s);
  }, 0);
}

UI Components (Props-first)

ProjectCard

type Props = { project: ProjectDTO; onEdit(): void; onArchive(): void; onUnarchive(): void; onDelete(): void; onOpen(): void; };

ProjectForm

type Props = { initial?: { name: string; description?: string }; onSubmit(v:{name:string;description?:string}): Promise<void>; onCancel(): void; };

ProjectToolbar

type Props = { status: "ACTIVE"|"ARCHIVED"; onStatusChange(s:"ACTIVE"|"ARCHIVED"): void; month: string; onMonthChange(m:string): void; onCreate(): void; search: string; onSearch(v:string): void; };

TaskRow

type Props = { task: TaskDTO;
  onPlay(): Promise<void>; onPause(): Promise<void>;
  onEdit(v:{name:string;description?:string}): Promise<void>;
  onDelete(): Promise<void>;
  onAddManual(v:{start:string;end:string}): Promise<void>;
};

TimerButton

type Props = { isRunning: boolean; onPlay(): void; onPause(): void; };

MonthSelector

type Props = { value: string /* YYYY-MM */; onChange(v:string): void; };

Stat

type Props = { label: string; value: string };

Table

type Props = { headers: string[]; rows: React.ReactNode[][] };

Pages (Behavior Notes)

/app/page.tsx
	•	Server component: redirect("/projects").

/app/(dashboard)/projects/page.tsx
	•	Server fetch: GET /api/projects?status&month&search.
	•	Actions: create/edit/archive/delete via server actions or fetches.
	•	UI: toolbar (status toggle, month selector, search), grid of ProjectCard, “New Project” modal.

/app/(dashboard)/projects/[projectId]/page.tsx
	•	Server fetch: project, tasks with month totals, active state.
	•	Header: editable name, status badge, month selector, total hours.
	•	Tasks table:
	•	TaskRow with Play/Pause.
	•	Inline “Add time” (start/end).
	•	“New Task” inline row or modal.

/app/(auth)/signin/page.tsx
	•	Button → signIn("github").

Timer Rules
	•	One active entry per user (enforced by closing other active entries on start):
	•	On POST /api/time-entries/start, find any entry where endTime is null and task.project.userId == userId, set endTime=now() before creating a new active entry.
	•	Resilience on refresh:
	•	Task row shows running state if activeEntry exists (no endTime).
	•	Prevent overlapping manual entries (soft):
	•	Validate with zod; reject if overlaps existing entry for same task (optional strictness: same project or entire user).

Validation (zod)

/lib/validators.ts

import { z } from "zod";
export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);
export const projectCreateSchema = z.object({ name: z.string().min(1).max(120), description: z.string().max(2000).optional() });
export const projectUpdateSchema = z.object({ name: z.string().min(1).max(120).optional(), description: z.string().max(2000).optional(), status: z.enum(["ACTIVE","ARCHIVED"]).optional() });
export const taskCreateSchema = z.object({ projectId: z.string().cuid(), name: z.string().min(1).max(140), description: z.string().max(2000).optional() });
export const taskUpdateSchema = z.object({ name: z.string().min(1).max(140).optional(), description: z.string().max(2000).optional() });
export const startSchema = z.object({ taskId: z.string().cuid() });
export const stopSchema = z.object({ taskId: z.string().cuid() });
export const manualEntrySchema = z.object({ taskId: z.string().cuid(), startTime: z.string().datetime(), endTime: z.string().datetime(), manual: z.literal(true) });
export const entryPatchSchema = z.object({ startTime: z.string().datetime().optional(), endTime: z.string().datetime().optional() }).refine(d => d.startTime || d.endTime, "Provide at least one field");

Minimal Route Handler Patterns

Example: POST /api/time-entries/start

import { auth } from "@/lib/auth"; import { db } from "@/lib/db";
import { startSchema } from "@/lib/validators"; import { now } from "@/lib/time";

export async function POST(req: Request) {
  const session = await auth(); if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = startSchema.parse(await req.json());
  const userId = session.user.id;

  // Close any active entry for this user
  await db.timeEntry.updateMany({
    where: { endTime: null, task: { project: { userId } } },
    data: { endTime: now() }
  });

  const entry = await db.timeEntry.create({
    data: { taskId: body.taskId, startTime: now() }
  });

  return Response.json({ id: entry.id, startTime: entry.startTime, taskId: entry.taskId, manual: false });
}

Example: POST /api/time-entries/stop

export async function POST(req: Request) {
  const session = await auth(); if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { taskId } = (await req.json()) as { taskId: string };
  const entry = await db.timeEntry.findFirst({ where: { taskId, endTime: null, task: { project: { userId: session.user.id } } }});
  if (!entry) return Response.json({ error: "No active entry" }, { status: 400 });
  const updated = await db.timeEntry.update({ where: { id: entry.id }, data: { endTime: new Date() }});
  return Response.json({ id: updated.id, startTime: updated.startTime, endTime: updated.endTime, taskId });
}

Formatting Helpers

/lib/date.ts

export const msToHhMm = (ms: number) => {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
};
export const toMonthISO = (d = new Date()) => d.toISOString().slice(0,7); // YYYY-MM

UI Notes (Tailwind, minimal)
	•	Cards, tables, badges; no UI lib required.
	•	Prefer accessible buttons: aria-pressed for play/pause.
	•	Keyboard: Enter to submit inline edits; Esc to cancel.

Edge Cases
	•	Deleting a project deletes tasks and entries (cascade).
	•	Archiving a project:
	•	Play on archived task: blocked with 409.
	•	Project remains visible under Archived filter.
	•	Prevent start when task/project not owned by user → 404.
	•	Manual entry with end < start → 400.

Testing Hooks
	•	Seed script to create user, sample project, tasks, entries.
	•	Route handler unit tests for start/stop and month totals.
