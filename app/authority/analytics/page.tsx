"use client"

import { useEffect, useState } from "react"
import { AuthorityNav } from "@/components/authority-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Users, Download } from "lucide-react"
import type { Analytics } from "@/lib/types"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics?timeRange=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [timeRange])

  const categoryData = analytics?.issuesByCategory
    ? Object.entries(analytics.issuesByCategory).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : []

  const priorityData = analytics?.issuesByPriority
    ? Object.entries(analytics.issuesByPriority).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : []

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthorityNav />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthorityNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into community issues and department performance.</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalIssues || 0}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.totalIssues
                  ? Math.round(((analytics.resolvedIssues || 0) / analytics.totalIssues) * 100)
                  : 0}
                %
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.avgResolutionTime || 0}d</div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="w-3 h-3 mr-1" />
                +0.5d from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.satisfactionRate || 0}%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Issue Trends</CardTitle>
              <CardDescription>Issues reported and resolved over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="issues"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issues by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Category</CardTitle>
              <CardDescription>Distribution of issue types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Response Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Average Response Time by Day</CardTitle>
              <CardDescription>How quickly issues are addressed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.dailyResponseTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} hours`, "Avg Response Time"]} />
                  <Line type="monotone" dataKey="avgHours" stroke="#f59e0b" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Priority Level</CardTitle>
              <CardDescription>Current priority distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Department Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators across different departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics?.departmentPerformance.map((dept) => (
                <div key={dept.department} className="space-y-4">
                  <h4 className="font-semibold text-gray-900">{dept.department}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Issues Resolved</span>
                        <span>{dept.issuesResolved}/{dept.totalIssues}</span>
                      </div>
                      <Progress value={(dept.issuesResolved / dept.totalIssues) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Avg Response Time</span>
                        <span>{dept.avgResponseTime} days</span>
                      </div>
                      <Progress value={100 - (dept.avgResponseTime / 10) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Satisfaction Rate</span>
                        <span>{dept.satisfactionRate}%</span>
                      </div>
                      <Progress value={dept.satisfactionRate} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
            <CardDescription>AI-powered analysis of your department's performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Strengths
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {analytics?.keyInsights.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-orange-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {analytics?.keyInsights.areasForImprovement.map((area, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
