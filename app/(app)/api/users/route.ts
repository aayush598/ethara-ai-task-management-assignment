import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { users } from "@/db/schema"
import { eq, ilike, asc, desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get("search")
  const sortBy = searchParams.get("sortBy") ?? "name"
  const sortOrder = searchParams.get("sortOrder") ?? "asc"

  const orderColumn = sortBy === "email" ? users.email : users.name
  const orderFn = sortOrder === "asc" ? asc : desc

  const conditions = []
  if (search) {
    conditions.push(ilike(users.name, `%${search}%`))
  }

  const query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)

  const result = conditions.length > 0
    ? await query.where(conditions[0]).orderBy(orderFn(orderColumn))
    : await query.orderBy(orderFn(orderColumn))

  return NextResponse.json(result)
}