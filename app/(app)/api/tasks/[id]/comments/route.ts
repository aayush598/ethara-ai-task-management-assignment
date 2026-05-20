import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { comments, tasks } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { createActivityLog } from "@/lib/activity"

const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const result = await db
    .select()
    .from(comments)
    .where(eq(comments.taskId, id))
    .orderBy(asc(comments.createdAt))

  return NextResponse.json(result)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const body = await request.json()
  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [comment] = await db
    .insert(comments)
    .values({
      id: createId(),
      content: parsed.data.content,
      taskId: id,
      userId: session.user.id,
    })
    .returning()

  await createActivityLog({
    actionType: "comment_added",
    performedById: session.user.id,
    targetEntity: task.title,
    targetId: task.id,
  })

  return NextResponse.json(comment, { status: 201 })
}