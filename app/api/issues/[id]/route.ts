import { type NextRequest, NextResponse } from "next/server"
import { getIssues, saveIssues } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const issues = await getIssues()
  const issue = issues.find((i) => i.id === params.id)

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }

  return NextResponse.json(issue)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const issues = await getIssues()
    const issueIndex = issues.findIndex((i) => i.id === params.id)

    if (issueIndex === -1) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    issues[issueIndex] = {
      ...issues[issueIndex],
      ...updates,
      updatedAt: new Date(),
    }

    await saveIssues(issues)

    return NextResponse.json(issues[issueIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}
