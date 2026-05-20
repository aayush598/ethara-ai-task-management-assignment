import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { projectMembers, projects, users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { createActivityLog } from "@/lib/activity"
import { requireAuth, requireProjectAccess } from "@/lib/auth-helpers"

const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().default("member"),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await requireAuth(request.headers)
    await requireProjectAccess((await params).id, authCtx)

    const { id } = await params

    const members = await db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        userId: projectMembers.userId,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
      })
      .from(projectMembers)
      .leftJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, id))

    return NextResponse.json(members)
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Project not found" }, { status: 404 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await requireAuth(request.headers)
    await requireProjectAccess((await params).id, authCtx)

    const { id } = await params

    const body = await request.json()
    const parsed = addMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { userId, role } = parsed.data

    const [existing] = await db
      .select()
      .from(projectMembers)
      .where(and(
        eq(projectMembers.projectId, id),
        eq(projectMembers.userId, userId),
      ))
      .limit(1)

    if (existing) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 })
    }

    const [member] = await db
      .insert(projectMembers)
      .values({
        id: createId(),
        projectId: id,
        userId,
        role,
      })
      .returning()

    const [project] = await db.select().from(projects).where(eq(projects.id, id))

    await createActivityLog({
      actionType: "member_added",
      performedById: authCtx.userId,
      targetEntity: project?.name || "Project",
      targetId: id,
      metadata: { userId, role },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Project not found" }, { status: 404 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCtx = await requireAuth(request.headers)
    await requireProjectAccess((await params).id, authCtx)

    const { id } = await params
    const memberId = request.nextUrl.searchParams.get("memberId")

    if (!memberId) {
      return NextResponse.json({ error: "memberId query param is required" }, { status: 400 })
    }

    const [member] = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.id, memberId))
      .limit(1)

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (member.userId === authCtx.userId) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 403 })
    }

    await db.delete(projectMembers).where(eq(projectMembers.id, memberId))

    const [project] = await db.select().from(projects).where(eq(projects.id, id))

    await createActivityLog({
      actionType: "member_removed",
      performedById: authCtx.userId,
      targetEntity: project?.name || "Project",
      targetId: id,
      metadata: { userId: member.userId },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (err.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (err.message === "NOT_FOUND") return NextResponse.json({ error: "Project not found" }, { status: 404 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}