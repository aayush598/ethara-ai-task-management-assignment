import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { projects } from "@/db/schema"
import { eq, ilike, asc, desc } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get("search")
  const sortBy = searchParams.get("sortBy") ?? "createdAt"
  const sortOrder = searchParams.get("sortOrder") ?? "desc"

  const orderColumn = sortBy === "name" ? projects.name : projects.createdAt
  const orderFn = sortOrder === "asc" ? asc : desc

  const conditions = []
  if (search) {
    conditions.push(ilike(projects.name, `%${search}%`))
  }

  const query = db.select().from(projects)
  const result = conditions.length > 0
    ? await query.where(conditions[0]).orderBy(orderFn(orderColumn))
    : await query.orderBy(orderFn(orderColumn))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, description } = parsed.data

  const [project] = await db
    .insert(projects)
    .values({
      id: createId(),
      name,
      description,
      createdById: session.user.id,
    })
    .returning()

  return NextResponse.json(project, { status: 201 })
}
