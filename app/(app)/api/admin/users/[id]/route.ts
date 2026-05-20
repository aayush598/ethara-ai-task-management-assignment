import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, role } = body

    await db.update(users)
      .set({ 
        name: name || undefined,
        role: role || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update user", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const userRole = (session.user as any)?.role
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await db.delete(users).where(eq(users.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete user", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}