import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects, projectMembers } from "@/db/schema"
import { eq, or, and } from "drizzle-orm"

export type AuthContext = {
  userId: string
  role: string
}

export async function requireAuth(headers: Headers): Promise<AuthContext> {
  const session = await auth.api.getSession({ headers })
  if (!session?.user) {
    throw new Error("UNAUTHORIZED")
  }
  return {
    userId: session.user.id,
    role: (session.user as any)?.role || "reviewer",
  }
}

export async function requireProjectAccess(projectId: string, authCtx: AuthContext): Promise<void> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))

  if (!project) {
    throw new Error("NOT_FOUND")
  }

  const isCreator = project.createdById === authCtx.userId
  const isAdmin = authCtx.role === "admin"

  if (isCreator || isAdmin) return

  const [member] = await db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, authCtx.userId),
      )
    )
    .limit(1)

  if (!member) {
    throw new Error("FORBIDDEN")
  }
}

export async function requireTaskAccess(taskId: string, authCtx: AuthContext): Promise<{ projectId: string }> {
  const { tasks } = await import("@/db/schema")
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))

  if (!task) {
    throw new Error("NOT_FOUND")
  }

  await requireProjectAccess(task.projectId, authCtx)
  return { projectId: task.projectId }
}