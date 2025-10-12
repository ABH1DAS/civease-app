import { type NextRequest, NextResponse } from "next/server"
import { getUsers } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()
    const users = await getUsers()

    const user = users.find((u) => u.email === email && u.role === role)

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = `mock-token-${user.id}`

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
      token,
    })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
