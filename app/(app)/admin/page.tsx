"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from "sonner"

export default function AdminPage() {
  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState<{ projects: number; tasks: number } | null>(null)

  const handleSeed = async () => {
    setSeeding(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Seed failed"); return }
      setResult(data)
      toast.success("Database seeded successfully!")
    } catch { toast.error("Something went wrong") }
    finally { setSeeding(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
        <p className="text-sm text-slate-500 mt-1">Manage application data and settings</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Seed Database</h2>
          <p className="text-sm text-slate-500">Populate the database with demo projects, tasks, and activity logs.</p>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeed} disabled={seeding}>
            {seeding ? "Seeding..." : "Seed Demo Data"}
          </Button>
          {result && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm font-semibold text-emerald-700">Seeded successfully!</p>
              <p className="text-xs text-emerald-600 mt-1 font-mono">{result.projects} projects, {result.tasks} tasks created</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
