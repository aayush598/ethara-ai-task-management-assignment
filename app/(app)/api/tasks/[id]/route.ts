import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { tasks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createActivityLog } from "@/lib/activity"

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "in_review", "approved", "rejected"]).optional(),
  assignedToId: z.string().nullable().optional(),
  evaluationType: z.enum(["safety", "accuracy", "relevance", "coherence"]).nullable().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable().optional(),
  confidenceScore: z.number().int().min(0).max(100).nullable().optional(),
  qaStatus: z.enum(["pending", "reviewed", "approved", "rejected"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
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

  return NextResponse.json(task)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const body = await request.json()
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { dueDate, ...rest } = parsed.data

  const [updated] = await db
    .update(tasks)
    .set({
      ...rest,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning()

  if (rest.assignedToId !== undefined) {
    await createActivityLog({
      actionType: "task_assigned",
      performedById: session.user.id,
      targetEntity: updated.title,
      targetId: updated.id,
      metadata: { assignedToId: updated.assignedToId },
    })
  } else if (rest.status) {
    await createActivityLog({
      actionType: "task_status_changed",
      performedById: session.user.id,
      targetEntity: updated.title,
      targetId: updated.id,
      metadata: { newStatus: rest.status },
    })
  } else {
    await createActivityLog({
      actionType: "task_updated",
      performedById: session.user.id,
      targetEntity: updated.title,
      targetId: updated.id,
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const [existing] = await db.select().from(tasks).where(eq(tasks.id, id))
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  await db.delete(tasks).where(eq(tasks.id, id))

  await createActivityLog({
    actionType: "task_deleted",
    performedById: session.user.id,
    targetEntity: existing.title,
    targetId: id,
  })

  return NextResponse.json({ success: true })
}