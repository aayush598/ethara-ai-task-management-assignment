"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { cn, formatDate, getInitials } from "@/lib/utils"
import {
  FolderKanban, Search, Plus, Loader2, AlertTriangle, FolderOpen,
  Layers, Calendar, Edit3, Trash2, MoreVertical,
} from "lucide-react"

/* ── Types ── */
interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  createdBy: string
  createdByName?: string
  status?: string
}

interface ProjectWithTasks extends Project {
  taskCount: number | null
}

/* ── Debounce hook ── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/* ── Skeleton ── */
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
}

/* ── Sort options ── */
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name A-Z" },
]

export default function ProjectsPage() {
  const router = useRouter()

  /* Data state */
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectWithTasks[]>([])

  /* Filter state */
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const debouncedSearch = useDebounce(searchQuery, 300)

  /* Dialog state */
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  /* Edit state */
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)

  /* Delete state */
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* Dropdown state */
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  /* ── Fetch projects ── */
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data: Project[] = await res.json()

      const withTaskCounts = await Promise.all(
        data.map(async (p) => {
          try {
            const tRes = await fetch(`/api/projects/${p.id}/tasks`)
            if (tRes.ok) {
              const tasks = await tRes.json()
              const count = Array.isArray(tasks) ? tasks.length : (tasks as any)?.length ?? null
              return { ...p, taskCount: count }
            }
            return { ...p, taskCount: null }
          } catch {
            return { ...p, taskCount: null }
          }
        })
      )

      setProjects(withTaskCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  /* ── Create project ── */
  const handleCreate = async () => {
    if (!formName.trim()) {
      setFormError("Project name is required")
      return
    }
    setFormSubmitting(true)
    setFormError(null)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim() || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || "Failed to create project")
      }
      setDialogOpen(false)
      setFormName("")
      setFormDescription("")
      fetchProjects()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setFormSubmitting(false)
    }
  }

  /* ── Edit project ── */
  const handleEditOpen = (project: Project) => {
    setEditTarget(project)
    setEditName(project.name)
    setEditDesc(project.description || "")
    setOpenDropdownId(null)
  }

  const handleEditSubmit = async () => {
    if (!editTarget || !editName.trim()) return
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() || null }),
      })
      if (!res.ok) throw new Error()
      setEditTarget(null)
      fetchProjects()
    } catch {
    } finally {
      setEditSubmitting(false)
    }
  }

  /* ── Delete project ── */
  const handleDeleteOpen = (project: Project) => {
    setDeleteTarget(project)
    setOpenDropdownId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setDeleteTarget(null)
      fetchProjects()
    } catch {
    } finally {
      setDeleting(false)
    }
  }

  /* ── Filtered & sorted ── */
  const filtered = projects
    .filter((p) => {
      if (!debouncedSearch) return true
      const q = debouncedSearch.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Failed to load projects</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchProjects}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200 hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 active:scale-[0.97]"
        >
          <Loader2 className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  /* ── Empty States ── */
  const hasSearch = debouncedSearch.trim().length > 0
  const showEmpty = filtered.length === 0

  if (showEmpty) {
    if (hasSearch) {
      return (
        <div className="space-y-6">
          <HeaderContent
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            projectCount={projects.length}
            onNewProject={() => setDialogOpen(true)}
          />
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="display text-base font-semibold text-slate-900 mb-2">No results found</h3>
            <p className="text-sm text-slate-500 mb-1">
              No projects match &ldquo;<span className="font-semibold text-slate-700">{debouncedSearch}</span>&rdquo;
            </p>
            <p className="text-xs text-slate-400 font-mono">Try a different search term</p>
          </div>
          <NewProjectDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            name={formName}
            onNameChange={setFormName}
            description={formDescription}
            onDescriptionChange={setFormDescription}
            submitting={formSubmitting}
            error={formError}
            onErrorClear={() => setFormError(null)}
            onSubmit={handleCreate}
          />
          <EditProjectDialog
            open={!!editTarget}
            onClose={() => setEditTarget(null)}
            name={editName}
            onNameChange={setEditName}
            desc={editDesc}
            onDescChange={setEditDesc}
            submitting={editSubmitting}
            onSubmit={handleEditSubmit}
          />
          <DeleteProjectDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            name={deleteTarget?.name || ""}
            submitting={deleting}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <HeaderContent
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          projectCount={projects.length}
          onNewProject={() => setDialogOpen(true)}
        />
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
            <FolderOpen className="w-9 h-9 text-indigo-400" />
          </div>
          <h3 className="display text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm text-center">
            Create your first project to start managing AI evaluation tasks and workflows.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create your first project
          </Button>
        </div>
        <NewProjectDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            name={formName}
            onNameChange={setFormName}
            description={formDescription}
            onDescriptionChange={setFormDescription}
            submitting={formSubmitting}
            error={formError}
            onErrorClear={() => setFormError(null)}
            onSubmit={handleCreate}
          />
          <EditProjectDialog
            open={!!editTarget}
            onClose={() => setEditTarget(null)}
            name={editName}
            onNameChange={setEditName}
            desc={editDesc}
            onDescChange={setEditDesc}
            submitting={editSubmitting}
            onSubmit={handleEditSubmit}
          />
          <DeleteProjectDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            name={deleteTarget?.name || ""}
            submitting={deleting}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      )
    }

    /* ── Main Content ── */
  return (
    <div className="space-y-6">
      <HeaderContent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        projectCount={projects.length}
        onNewProject={() => setDialogOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <Card key={project.id} className="relative group">
            <CardContent className="p-0">
              <div
                className="p-5 cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="space-y-3">
                  <h3 className="display text-sm font-semibold text-slate-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Layers className="w-3 h-3" />
                      <span>{project.taskCount !== null ? project.taskCount : "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-700">
                      {project.createdByName
                        ? getInitials(project.createdByName)
                        : getInitials(project.createdBy)}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono truncate">
                      {project.createdByName || project.createdBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenDropdownId(openDropdownId === project.id ? null : project.id)
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openDropdownId === project.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                    <div className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-slate-200 bg-white shadow-xl py-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditOpen(project) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-slate-400" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteOpen(project) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NewProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        name={formName}
        onNameChange={setFormName}
        description={formDescription}
        onDescriptionChange={setFormDescription}
        submitting={formSubmitting}
        error={formError}
        onErrorClear={() => setFormError(null)}
        onSubmit={handleCreate}
      />

      <EditProjectDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        name={editName}
        onNameChange={setEditName}
        desc={editDesc}
        onDescChange={setEditDesc}
        submitting={editSubmitting}
        onSubmit={handleEditSubmit}
      />
      <DeleteProjectDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        name={deleteTarget?.name || ""}
        submitting={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

/* ── Sub-components ── */

function HeaderContent({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  projectCount,
  onNewProject,
}: {
  searchQuery: string
  onSearchChange: (v: string) => void
  sortBy: string
  onSortChange: (v: string) => void
  projectCount: number
  onNewProject: () => void
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <h1 className="display text-xl font-bold text-slate-900">Projects</h1>
          <Badge variant="indigo">{projectCount}</Badge>
        </div>
        <p className="text-sm text-slate-500 font-mono">
          Manage your AI evaluation projects
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex h-10 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <Select
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-36"
        />
        <Button onClick={onNewProject}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </Button>
      </div>
    </div>
  )
}

function EditProjectDialog({
  open,
  onClose,
  name,
  onNameChange,
  desc,
  onDescChange,
  submitting,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  name: string
  onNameChange: (v: string) => void
  desc: string
  onDescChange: (v: string) => void
  submitting: boolean
  onSubmit: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader><h2 className="text-lg font-bold text-slate-900">Edit Project</h2></DialogHeader>
      <DialogContent className="space-y-4">
        <Input label="Project Name" id="edit-name" value={name} onChange={(e) => onNameChange(e.target.value)} />
        <Textarea label="Description" id="edit-desc" value={desc} onChange={(e) => onDescChange(e.target.value)} />
      </DialogContent>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

function DeleteProjectDialog({
  open,
  onClose,
  name,
  submitting,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  name: string
  submitting: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader><h2 className="text-lg font-bold text-slate-900">Delete Project</h2></DialogHeader>
      <DialogContent>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{name}</strong>? This will also delete all tasks and data associated with it. This cannot be undone.
        </p>
      </DialogContent>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Deleting..." : "Delete Project"}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

function NewProjectDialog({
  open,
  onClose,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  submitting,
  error,
  onErrorClear,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  name: string
  onNameChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  submitting: boolean
  error: string | null
  onErrorClear: () => void
  onSubmit: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
        onErrorClear()
      }}
    >
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="display text-base font-semibold text-slate-900">New Project</h2>
            <p className="text-xs text-slate-500 font-mono">Create a new evaluation project</p>
          </div>
        </div>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <Input
            label="Project Name"
            id="project-name"
            placeholder="e.g. Safety Benchmark Q2"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <Textarea
            label="Description (optional)"
            id="project-desc"
            placeholder="Describe the project scope and objectives..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
          {error && (
            <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => {
            onClose()
            onErrorClear()
          }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Project"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
