import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await auth.api.deleteUser({
      body: {},
      headers: request.headers,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const message = err?.message || err?.status || "Failed to delete account"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}