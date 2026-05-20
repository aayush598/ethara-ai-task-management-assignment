import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users, projects, tasks } from "@/db/schema"
import { sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const [userCount, projectCount, taskStats, sessionCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(projects),
      db.select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where status = 'pending')`,
        approved: sql<number>`count(*) filter (where status = 'approved')`,
        rejected: sql<number>`count(*) filter (where status = 'rejected')`,
      }).from(tasks),
      db.select({ count: sql<number>`count(*)` }).from(sql`session`),
    ])

    return NextResponse.json({
      totalUsers: userCount[0]?.count || 0,
      totalProjects: projectCount[0]?.count || 0,
      totalTasks: taskStats[0]?.total || 0,
      pendingTasks: taskStats[0]?.pending || 0,
      approvedTasks: taskStats[0]?.approved || 0,
      rejectedTasks: taskStats[0]?.rejected || 0,
      activeSessions: sessionCount[0]?.count || 0,
    })
  } catch (error) {
    console.error("Failed to fetch stats", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}