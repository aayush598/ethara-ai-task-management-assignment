import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { projects, tasks, activityLogs } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const projectData = [
      { name: "LLM Safety Evaluation", description: "Evaluate LLM responses for harmful content, bias, and safety violations across multiple categories." },
      { name: "Prompt Quality Benchmarking", description: "Benchmark prompt-response quality for relevance, clarity, and instruction following." },
      { name: "RLHF Dataset Validation", description: "Validate preference pairs for RLHF training data quality and consistency." },
      { name: "Hallucination Detection Batch", description: "Identify and categorize hallucination patterns in model outputs." },
    ]

    const seededProjects = []
    for (const p of projectData) {
      const [project] = await db.insert(projects).values({
        id: createId(),
        name: p.name,
        description: p.description,
        createdById: session.user.id,
      }).returning()
      seededProjects.push(project)

      await db.insert(activityLogs).values({
        id: createId(),
        actionType: "project_created",
        performedById: session.user.id,
        targetEntity: "project",
        targetId: project.id,
        metadata: { name: project.name },
      })
    }

    const taskData = [
      { title: "Evaluate toxicity classification", description: "Review and classify toxic content in model responses across different demographic groups.", projectIdx: 0, type: "safety", severity: "high" },
      { title: "Validate reasoning chain coherence", description: "Check if the model's reasoning steps are logically consistent and well-structured.", projectIdx: 1, type: "coherence", severity: "medium" },
      { title: "Review hallucination severity", description: "Assess the severity and type of hallucination in provided model outputs.", projectIdx: 3, type: "accuracy", severity: "high" },
      { title: "Benchmark prompt relevance", description: "Score how well model responses address the specific prompt instructions.", projectIdx: 1, type: "relevance", severity: "medium" },
      { title: "RLHF alignment verification", description: "Verify that preference rankings align with human values and safety guidelines.", projectIdx: 2, type: "safety", severity: "critical" },
      { title: "Categorize harmful outputs", description: "Classify harmful outputs into categories like hate speech, harassment, or dangerous content.", projectIdx: 0, type: "safety", severity: "high" },
      { title: "Validate dataset consistency", description: "Check for labeling inconsistencies across the preference dataset.", projectIdx: 2, type: "accuracy", severity: "low" },
      { title: "Check bias in model responses", description: "Evaluate model responses for demographic and representational biases.", projectIdx: 0, type: "relevance", severity: "medium" },
      { title: "Evaluate model coherence", description: "Assess overall coherence and logical flow of long-form model responses.", projectIdx: 1, type: "coherence", severity: "low" },
      { title: "Review prompt-response pairs", description: "Quality check prompt-response pairs for clarity, accuracy, and completeness.", projectIdx: 3, type: "accuracy", severity: "medium" },
    ]

    for (const t of taskData) {
      const [task] = await db.insert(tasks).values({
        id: createId(),
        title: t.title,
        description: t.description,
        projectId: seededProjects[t.projectIdx].id,
        createdById: session.user.id,
        evaluationType: t.type as any,
        severity: t.severity as any,
        status: ["pending", "in_review", "approved", "rejected"][Math.floor(Math.random() * 4)] as any,
        confidenceScore: Math.floor(Math.random() * 5) + 1,
        qaStatus: ["pending", "reviewed", "approved", "rejected"][Math.floor(Math.random() * 4)] as any,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      }).returning()

      await db.insert(activityLogs).values({
        id: createId(),
        actionType: "task_created",
        performedById: session.user.id,
        targetEntity: "task",
        targetId: task.id,
        metadata: { title: task.title, projectId: task.projectId },
      })
    }

    return NextResponse.json({
      success: true,
      projects: projectData.length,
      tasks: taskData.length,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Seed failed" }, { status: 500 })
  }
}
