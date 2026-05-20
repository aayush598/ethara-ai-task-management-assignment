import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { tasks, projects } from "@/db/schema"
import { eq, asc, desc } from "drizzle-orm"

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

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const sortBy = searchParams.get("sortBy") ?? "createdAt"
  const sortOrder = searchParams.get("sortOrder") ?? "desc"

  const orderFn = sortOrder === "asc" ? asc : desc
  const orderColumn = sortBy === "title" ? tasks.title : tasks.createdAt

  const conditions = [eq(tasks.projectId, id)]
  if (status) {
    conditions.push(eq(tasks.status, status as typeof tasks.$inferSelect.status))
  }

  const result = await db
    .select()
    .from(tasks)
    .where(conditions[0])
    .orderBy(orderFn(orderColumn))

  return NextResponse.json(result)
}
