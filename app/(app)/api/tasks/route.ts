import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { tasks } from "@/db/schema"
import { eq, and, ilike, asc, desc } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { createActivityLog } from "@/lib/activity"

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project ID is required"),
  assignedToId: z.string().optional(),
  evaluationType: z.enum(["safety", "accuracy", "relevance", "coherence"]).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const projectId = searchParams.get("projectId")
  const assignedToId = searchParams.get("assignedToId")
  const search = searchParams.get("search")
  const sortBy = searchParams.get("sortBy") ?? "createdAt"
  const sortOrder = searchParams.get("sortOrder") ?? "desc"

  const conditions = []
  if (status) {
    conditions.push(eq(tasks.status, status as typeof tasks.$inferSelect.status))
  }
  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId))
  }
  if (assignedToId) {
    conditions.push(eq(tasks.assignedToId, assignedToId))
  }
  if (search) {
    conditions.push(ilike(tasks.title, `%${search}%`))
  }

  const orderFn = sortOrder === "asc" ? asc : desc
  const orderColumn = sortBy === "title" ? tasks.title : tasks.createdAt

  const result = conditions.length > 0
    ? await db.select().from(tasks).where(and(...conditions)).orderBy(orderFn(orderColumn))
    : await db.select().from(tasks).orderBy(orderFn(orderColumn))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { dueDate, ...rest } = parsed.data

  const [task] = await db
    .insert(tasks)
    .values({
      id: createId(),
      ...rest,
      createdById: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })
    .returning()

  await createActivityLog({
    actionType: "task_created",
    performedById: session.user.id,
    targetEntity: task.title,
    targetId: task.id,
    metadata: { projectId: task.projectId },
  })

  return NextResponse.json(task, { status: 201 })
}