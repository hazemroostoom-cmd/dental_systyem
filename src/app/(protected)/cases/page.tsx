"use client";

import { useState } from "react";
import { useDentalStore } from "@/store/useDentalStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Case, CaseStatus } from "@/types";
import { 
  Search, 
  Filter, 
  Plus, 
  LayoutGrid, 
  List as ListIcon,
  ChevronDown,
  MoreHorizontal,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function CaseListPage() {
  const { cases } = useDentalStore();
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'All'>('All');

  const filteredCases = statusFilter === 'All' 
    ? cases 
    : cases.filter((c: Case) => c.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-sm text-gray-500">Manage and track all your laboratory cases.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setView('table')}
              className={`p-2 rounded-lg transition-colors ${view === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-lg transition-colors ${view === 'kanban' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Case
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient name, ID..."
            className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Statuses</option>
            <option value="ScanReceived">Scan Received</option>
            <option value="Design">Design</option>
            <option value="AwaitingApproval">Awaiting Approval</option>
            <option value="InProduction">In Production</option>
            <option value="Shipped">Shipped</option>
          </select>
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </Card>

      {view === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-50">
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCases.map((c: Case) => (
                  <tr key={c.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/cases/${c.id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                        {c.patientName}
                      </Link>
                      <p className="text-xs text-gray-400">#CAS-{c.id.padStart(4, '0')}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{c.caseType}</td>
                    <td className="px-6 py-4">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {(c.technicianId ?? 'T').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600">{c.technicianId ?? 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{new Date(c.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {['ScanReceived', 'Design', 'AwaitingApproval', 'InProduction', 'Shipped'].map((status) => (
            <div 
              key={status} 
              className="space-y-4 bg-gray-50/50 p-4 rounded-2xl min-w-[280px]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-gray-100');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-gray-100');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('bg-gray-100');
                const caseId = e.dataTransfer.getData('caseId');
                if (caseId) {
                  useDentalStore.getState().updateCaseStatus(caseId, status as CaseStatus);
                }
              }}
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-gray-900">
                  {status.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-white shadow-sm px-2 py-0.5 rounded-full border border-gray-100">
                  {cases.filter((c: Case) => c.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {cases.filter((c: Case) => c.status === status).map((c: Case) => (
                  <Card 
                    key={c.id} 
                    className="p-4 hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-gray-200/60 hover:border-primary-200"
                    draggable
                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                      e.dataTransfer.setData('caseId', c.id);
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e: React.DragEvent<HTMLDivElement>) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <Link href={`/cases/${c.id}`} className="block">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          #CAS-{c.id.padStart(4, '0')}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{c.patientName}</p>
                      <p className="text-xs text-gray-500 mt-1">{c.caseType}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-[10px] text-red-600 font-medium">{new Date(c.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700 shadow-sm" title={c.technicianId ?? 'Unassigned'}>
                            {(c.technicianId ?? 'T').slice(0, 2).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
