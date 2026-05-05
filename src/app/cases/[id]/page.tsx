"use client";

import { useState, useRef, useEffect } from "react";
import { useDentalStore } from "@/store/useDentalStore";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { DentalViewer } from "@/components/viewer/DentalViewer";
import { 
  ChevronLeft, 
  Send, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  MoreVertical,
  Paperclip,
  Smile,
  Download,
  History,
  Check,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { CaseStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Dropdown } from "@/components/ui/Dropdown";

export default function CaseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cases, updateCaseStatus, addComment, addAnnotation, resolveAnnotation } = useDentalStore();
  
  const dentalCase = cases.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'comments' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dentalCase?.comments, activeTab]);

  if (!dentalCase) {
    return <div className="p-8 text-center text-gray-500">Case not found</div>;
  }

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;
    addComment(dentalCase.id, {
      sender: "Dr. Sarah Wilson",
      text: message,
      isOwn: true
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddAnnotation = (pos: [number, number, number]) => {
    const text = prompt("Enter annotation text:");
    if (text) {
      addAnnotation(dentalCase.id, {
        position: pos,
        text: text,
        author: "Dr. Sarah Wilson",
      });
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "files", label: "Files" },
    { id: "design", label: "Design Review" },
    { id: "comments", label: "Chat" },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* Top Bar - Sticky */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-2 -mt-2">
        <div className="flex items-center gap-4">
          <Link href="/cases" className="p-2 hover:bg-white rounded-xl border border-gray-100 transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{dentalCase.patientName}</h1>
              <Badge status={dentalCase.status} />
            </div>
            <p className="text-sm text-gray-500">Case #CAS-{dentalCase.id.padStart(4, '0')} • Created on {new Date(dentalCase.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Request Changes
          </Button>
          <Button 
            className="gap-2"
            onClick={() => updateCaseStatus(dentalCase.id, 'InProduction')}
            disabled={dentalCase.status === 'InProduction' || dentalCase.status === 'Shipped'}
          >
            <CheckCircle className="w-4 h-4" />
            Approve Design
          </Button>
          <Dropdown 
            trigger={
              <button className="p-2 hover:bg-white rounded-xl border border-gray-100 transition-colors shadow-sm text-gray-400 h-full">
                <MoreVertical className="w-5 h-5" />
              </button>
            }
          >
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Edit Case</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Duplicate</button>
              <div className="my-1 border-t border-gray-100" />
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Delete Case</button>
            </div>
          </Dropdown>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: 3D Viewer */}
        <div className="flex-[3] bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden relative">
          <DentalViewer 
            annotations={dentalCase.annotations}
            onAddAnnotation={handleAddAnnotation}
            fileUrl={dentalCase.files.length > 0 ? dentalCase.files[0].url : undefined}
            onAnnotationClick={setSelectedAnnotation}
            selectedAnnotationId={selectedAnnotation || undefined}
          />
        </div>

        {/* Right: Info / Tabs */}
        <div className="flex-[2] flex flex-col bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            className="px-4 pt-2"
          />
          
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Name</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{dentalCase.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase">Case Type</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{dentalCase.caseType}</p>
                    </div>
                  </div>
                  {dentalCase.description && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 font-medium uppercase mb-1">Description</p>
                      <p className="text-sm text-gray-700">{dentalCase.description}</p>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Assignment</h3>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {dentalCase.technician.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dentalCase.technician}</p>
                      <p className="text-xs text-gray-500">Lead Technician</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Dates</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase">Due Date</p>
                        <p className="text-sm font-semibold text-red-600">{new Date(dentalCase.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex-1 space-y-6">
                  {dentalCase.comments.map((comment) => (
                    <div key={comment.id} className={cn("flex gap-3", comment.isOwn && "flex-row-reverse")}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", comment.isOwn ? "bg-primary-100 text-primary-700" : "bg-gray-100")}>
                        {comment.sender.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={cn("flex flex-col", comment.isOwn ? "items-end" : "items-start")}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-gray-900">{comment.sender}</p>
                          <p className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className={cn("px-4 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm", comment.isOwn ? "bg-primary-600 text-white rounded-tr-sm" : "bg-gray-50 text-gray-900 rounded-tl-sm")}>
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {dentalCase.comments.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-900">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Start the conversation with your technician.</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 bg-white">
                  <div className="relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none h-[100px] outline-none transition-all"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleSendMessage}
                        className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!message.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-2">Press Enter to send, Shift + Enter for new line</p>
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
                {dentalCase.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{file.name}</p>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">v{file.version}</span>
                        </div>
                        <p className="text-xs text-gray-400 uppercase font-medium mt-0.5">{file.type} • {file.size} • {new Date(file.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <History className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                {dentalCase.files.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-sm text-gray-400">No files uploaded yet.</p>
                  </div>
                )}
                <div className="border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center mt-4 hover:bg-primary-50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Paperclip className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Upload new files</p>
                  <p className="text-xs text-gray-500 mt-1">Drag and drop or click to browse</p>
                </div>
              </div>
            )}

            {activeTab === "design" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {dentalCase.status === 'AwaitingApproval' && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Awaiting Approval</p>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">Please review the 3D model and annotations before approving for production.</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Design Annotations</h3>
                  <span className="text-xs font-medium text-gray-500">{dentalCase.annotations.length} total</span>
                </div>
                
                <div className="space-y-3">
                  {dentalCase.annotations.map((ann) => (
                    <div 
                      key={ann.id} 
                      onClick={() => setSelectedAnnotation(ann.id)}
                      className={cn(
                        "p-4 border rounded-xl transition-all cursor-pointer",
                        selectedAnnotation === ann.id ? "border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500" : "border-gray-100 hover:border-gray-300 bg-white",
                        ann.resolved && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", ann.resolved ? "bg-emerald-100 text-emerald-700" : "bg-primary-100 text-primary-700")}>
                            {ann.resolved ? "Resolved" : `Pin #${ann.id.slice(0, 4)}`}
                          </span>
                          <span className="text-[10px] text-gray-400">{new Date(ann.timestamp).toLocaleDateString()}</span>
                        </div>
                        {!ann.resolved && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); resolveAnnotation(dentalCase.id, ann.id); }}
                            className="text-gray-400 hover:text-emerald-600 transition-colors p-1"
                            title="Mark resolved"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className={cn("text-sm mt-2", ann.resolved ? "text-gray-400 line-through" : "text-gray-700 font-medium")}>{ann.text}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">
                          {ann.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <p className="text-xs text-gray-500">{ann.author}</p>
                      </div>
                    </div>
                  ))}
                  {dentalCase.annotations.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No annotations yet. Click on the 3D model to add one.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-6 animate-in fade-in duration-300 pl-4">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                  {dentalCase.timeline?.map((event, index) => (
                    <div key={event.id} className="relative pl-8">
                      <div className={cn(
                        "absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white",
                        index === dentalCase.timeline.length - 1 ? "bg-primary-500 shadow-sm shadow-primary-200" : "bg-gray-300"
                      )} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 mb-1">
                          {new Date(event.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{event.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 font-medium">{event.author}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

