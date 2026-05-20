import { db } from "@/lib/db"
import { activityLogs } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

type ActionType = 
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "task_assigned"
  | "task_status_changed"
  | "evaluation_submitted"
  | "comment_added"
  | "member_added"
  | "member_removed"

export async function createActivityLog(params: {
  actionType: ActionType
  performedById: string
  targetEntity?: string | null
  targetId?: string | null
  metadata?: Record<string, unknown> | null
}) {
  try {
    await db.insert(activityLogs).values({
      id: createId(),
      actionType: params.actionType,
      performedById: params.performedById,
      targetEntity: params.targetEntity || null,
      targetId: params.targetId || null,
      metadata: params.metadata || null,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Failed to create activity log:", error)
  }
}