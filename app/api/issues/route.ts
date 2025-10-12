import { type NextRequest, NextResponse } from "next/server"
import { getIssues, saveIssues } from "@/lib/db"
import { Issue } from "@/lib/types"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const citizenId = searchParams.get("citizenId")
  const status = searchParams.get("status")
  const category = searchParams.get("category")

  let issues = await getIssues()

  if (citizenId) {
    issues = issues.filter((issue) => issue.citizenId === citizenId)
  }

  if (status) {
    issues = issues.filter((issue) => issue.status === status)
  }

  if (category) {
    issues = issues.filter((issue) => issue.category === category)
  }

  return NextResponse.json(issues)
}

export async function POST(request: NextRequest) {
  try {
    const issueData = await request.json()
    const issues = await getIssues()

    const newIssue: Issue = {
      id: String(issues.length + 1),
      ...issueData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    issues.push(newIssue)
    await saveIssues(issues)

    return NextResponse.json(newIssue, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
