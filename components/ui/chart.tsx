'use client'

import { useEffect, useState } from 'react'
import { AuthorityNav } from '@/components/authority-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
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
  AreaChart,
  Area,
} from 'recharts'
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Users, Download } from 'lucide-react'
import type { Analytics } from '@/lib/types'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [timeRange])

  const monthlyData = [
    { month: 'Jan', issues: 45, resolved: 38, satisfaction: 85 },
    { month: 'Feb', issues: 52, resolved: 44, satisfaction: 87 },
    { month: 'Mar', issues: 48, resolved: 41, satisfaction: 89 },
    { month: 'Apr', issues: 61, resolved: 53, satisfaction: 86 },
    { month: 'May', issues: 55, resolved: 49, satisfaction: 91 },
    { month: 'Jun', issues: 67, resolved: 58, satisfaction: 88 },
  ]

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

  const responseTimeData = [
    { day: 'Mon', avgHours: 18 },
    { day: 'Tue', avgHours: 22 },
    { day: 'Wed', avgHours: 16 },
    { day: 'Thu', avgHours: 24 },
    { day: 'Fri', avgHours: 20 },
    { day: 'Sat', avgHours: 28 },
    { day: 'Sun', avgHours: 32 },
  ]

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

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

  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) =>
    `${name} ${(percent * 100).toFixed(0)}%`

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
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="issues" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
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

        {/* Remaining charts (line, bar) and sections unchanged */}
      </main>
    </div>
  )
}
