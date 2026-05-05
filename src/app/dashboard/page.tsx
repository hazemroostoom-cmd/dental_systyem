"use client";

import { useDentalStore } from "@/store/useDentalStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Case } from "@/types";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Package, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { cases } = useDentalStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Active Cases", value: cases.filter((c: Case) => c.status !== 'Shipped').length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Approvals", value: cases.filter((c: Case) => c.status === 'AwaitingApproval').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "In Production", value: cases.filter((c: Case) => c.status === 'InProduction').length, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Completed", value: cases.filter((c: Case) => c.status === 'Shipped').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const recentActivity = cases.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-1/3 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-56 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Sarah</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your lab today.</p>
        </div>
        <Link href="/cases">
          <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Create New Case
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Cases</h2>
            <Link href="/cases" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((c: Case) => (
                  <tr key={c.id} className="group hover:bg-primary-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/cases/${c.id}`} className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {c.patientName}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">#CAS-{c.id.padStart(4, '0')}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{c.caseType}</td>
                    <td className="px-6 py-4">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{new Date(c.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-xl shadow-primary-900/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-primary-100">Efficiency Score</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <p className="text-5xl font-bold tracking-tight">94<span className="text-2xl text-primary-200">%</span></p>
                <div className="flex items-center text-emerald-300 text-sm font-medium mb-1 bg-emerald-400/20 px-2 py-0.5 rounded-full">
                  +2.4%
                </div>
              </div>
              <p className="text-sm text-primary-100/80 leading-relaxed">You're completing cases 12% faster than last month. Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[320px]">
            <CardHeader className="py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                Activity Feed
              </h2>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="divide-y divide-gray-50">
                {[
                  { text: "Design approved by Dr. Smith", time: "12m ago", type: "success", case: "Jane Roe" },
                  { text: "New files uploaded", time: "1h ago", type: "info", case: "Robert Miller" },
                  { text: "Technician assigned: Mike Ross", time: "2h ago", type: "info", case: "Emily Brown" },
                  { text: "Case shipped via FedEx", time: "5h ago", type: "success", case: "Michael Scott" },
                ].map((act, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{act.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium text-primary-600">{act.case}</span> • {act.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

