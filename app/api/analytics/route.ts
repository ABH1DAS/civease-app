import { NextResponse } from "next/server";
import { getIssues, getUsers } from "@/lib/db";
import { Issue, Analytics, User } from "@/lib/types";

// Helper function to calculate average
const average = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
// Helper to convert ms to days
const msToDays = (ms: number) => ms / (1000 * 60 * 60 * 24);

export async function GET(request: Request) {
  const issues = await getIssues();
  const users = await getUsers();
  const authorityUsers = users.filter(u => u.role === 'authority');

  // Basic stats
  const totalIssues = issues.length;
  const resolvedIssuesList = issues.filter(
    (issue) => issue.status === "resolved" || issue.status === "closed"
  );
  const resolvedIssues = resolvedIssuesList.length;
  const pendingIssues = totalIssues - resolvedIssues;

  // Resolution time
  const resolutionTimes = resolvedIssuesList
    .map((issue) => {
        if (issue.resolvedAt) {
            return new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()
        }
        return null;
    })
    .filter((t): t is number => t !== null);

  const avgResolutionTime = msToDays(average(resolutionTimes));

  // By category and priority
  const issuesByCategory = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const issuesByPriority = issues.reduce((acc, issue) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly trends for the last 6 months
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();

    const issuesInMonth = issues.filter(issue => {
        const issueDate = new Date(issue.createdAt);
        return issueDate.getMonth() === d.getMonth() && issueDate.getFullYear() === year;
    });
    const resolvedInMonth = issuesInMonth.filter(issue => issue.status === 'resolved' || issue.status === 'closed');

    return { month, issues: issuesInMonth.length, resolved: resolvedInMonth.length };
  }).reverse();

  // Department performance
  const departments = [...new Set(authorityUsers.map(u => u.department).filter(d => d))];
  const departmentPerformance = departments.map(department => {
      const departmentUsers = authorityUsers.filter(u => u.department === department);
      const departmentUserIds = departmentUsers.map(u => u.id);
      const departmentIssues = issues.filter(i => i.assignedTo && departmentUserIds.includes(i.assignedTo));
      const departmentIssuesResolved = departmentIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;

      return {
          department: department as string,
          totalIssues: departmentIssues.length,
          issuesResolved: departmentIssuesResolved,
          // Mocking these as they require more data
          avgResponseTime: Math.random() * 5,
          satisfactionRate: 80 + Math.random() * 20
      };
  });


  const analytics: Analytics = {
    totalIssues,
    resolvedIssues,
    pendingIssues,
    avgResolutionTime,
    satisfactionRate: 80 + Math.random() * 20, // Mocked
    issuesByCategory,
    issuesByPriority,
    monthlyTrends,
    departmentPerformance,
    // Mocks for data we can't compute
    dailyResponseTime: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      day,
      avgHours: 10 + Math.random() * 20, // Mocked
    })),
    keyInsights: { // Mocked
      strengths: [
        "Data is now being dynamically calculated from the database.",
      ],
      areasForImprovement: [
        "Some analytics fields are still mocked due to data model limitations (e.g., satisfaction rate).",
      ],
    },
  };

  return NextResponse.json(analytics);
}
