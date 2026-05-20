import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { projects } from "@/db/schema"
import { eq } from "drizzle-orm"
import { createActivityLog } from "@/lib/activity"

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
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

  const [project] = await db.select().from(projects).where(eq(projects.id, id))
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(project)
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

  const [existing] = await db.select().from(projects).where(eq(projects.id, id))
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const body = await request.json()
  const parsed = updateProjectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [updated] = await db
    .update(projects)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()

  await createActivityLog({
    actionType: "project_updated",
    performedById: session.user.id,
    targetEntity: updated.name,
    targetId: updated.id,
  })

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

  const [existing] = await db.select().from(projects).where(eq(projects.id, id))
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  await db.delete(projects).where(eq(projects.id, id))

  await createActivityLog({
    actionType: "project_deleted",
    performedById: session.user.id,
    targetEntity: existing.name,
    targetId: id,
  })

  return NextResponse.json({ success: true })
}