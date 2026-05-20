import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = passwordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { currentPassword, newPassword } = parsed.data

    await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: request.headers,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const message = err?.message || err?.status || "Failed to change password"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}