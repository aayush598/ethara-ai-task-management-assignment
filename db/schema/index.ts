import { pgTable, text, timestamp, integer, pgEnum, boolean, jsonb, varchar } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"

export const roleEnum = pgEnum("role", ["admin", "reviewer"])
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_review", "approved", "rejected"])
export const evaluationTypeEnum = pgEnum("evaluation_type", ["safety", "accuracy", "relevance", "coherence"])
export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"])
export const qaStatusEnum = pgEnum("qa_status", ["pending", "reviewed", "approved", "rejected"])
export const activityActionEnum = pgEnum("activity_action", [
  "project_created",
  "project_updated",
  "project_deleted",
  "task_created",
  "task_updated",
  "task_deleted",
  "task_assigned",
  "task_status_changed",
  "evaluation_submitted",
  "comment_added",
  "member_added",
  "member_removed",
])

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  password: text("password"),
  role: roleEnum("role").notNull().default("reviewer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const sessions = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
})

export const accounts = pgTable("account", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verifications = pgTable("verification", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
})

export const projects = pgTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("pending"),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  assignedToId: text("assigned_to_id").references(() => users.id),
  createdById: text("created_by_id").notNull().references(() => users.id),
  evaluationType: evaluationTypeEnum("evaluation_type"),
  severity: severityEnum("severity"),
  confidenceScore: integer("confidence_score"),
  qaStatus: qaStatusEnum("qa_status").notNull().default("pending"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const comments = pgTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  content: text("content").notNull(),
  taskId: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  actionType: activityActionEnum("action_type").notNull(),
  performedById: text("performed_by_id").notNull().references(() => users.id),
  targetEntity: text("target_entity"),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  createdProjects: many(projects, { relationName: "createdBy" }),
  assignedTasks: many(tasks, { relationName: "assignedTo" }),
  createdTasks: many(tasks, { relationName: "taskCreatedBy" }),
  comments: many(comments),
  activityLogs: many(activityLogs),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projects.createdById],
    references: [users.id],
    relationName: "createdBy",
  }),
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignedTo",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "taskCreatedBy",
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}))

export const projectMembers = pgTable("project_members", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
})

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  performedBy: one(users, {
    fields: [activityLogs.performedById],
    references: [users.id],
  }),
}))
