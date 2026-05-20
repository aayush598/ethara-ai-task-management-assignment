import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { activityLogs } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const offset = (page - 1) * limit

  const [totalResult] = await db
    .select({ count: db.$count(activityLogs) })
    .from(activityLogs)

  const total = totalResult?.count ?? 0

  const logs = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset)

  return NextResponse.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
