import { create } from 'zustand';
import { Case, CaseStatus, Comment, Annotation, Notification, TimelineEvent } from '../types';
import { MOCK_CASES } from '../mock/data';

interface DentalStore {
  cases: Case[];
  activeCaseId: string | null;
  notifications: Notification[];
  setActiveCase: (id: string | null) => void;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  addComment: (caseId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  addAnnotation: (caseId: string, annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  resolveAnnotation: (caseId: string, annotationId: string) => void;
  markNotificationRead: (id: string) => void;
  addTimelineEvent: (caseId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
}

export const useDentalStore = create<DentalStore>((set) => ({
  cases: MOCK_CASES,
  activeCaseId: null,
  notifications: [
    { id: "n1", type: "success", text: "Design ready for approval", time: "2m ago", read: false, link: "/cases/1" },
    { id: "n2", type: "info", text: "Case #0005 shipped", time: "1h ago", read: false, link: "/cases/5" },
    { id: "n3", type: "warning", text: "New comment on John Doe case", time: "3h ago", read: true, link: "/cases/1" },
  ],
  setActiveCase: (id: string | null) => set({ activeCaseId: id }),
  updateCaseStatus: (id: string, status: CaseStatus) =>
    set((state: DentalStore) => {
      const updatedCases = state.cases.map((c: Case) => {
        if (c.id === id) {
          const newEvent: TimelineEvent = {
            id: Math.random().toString(36).substr(2, 9),
            status,
            description: `Status changed to ${status}`,
            timestamp: new Date().toISOString(),
            author: "Dr. Sarah Wilson"
          };
          return { ...c, status, timeline: [...c.timeline, newEvent] };
        }
        return c;
      });
      return { cases: updatedCases };
    }),
  addComment: (caseId: string, comment: Omit<Comment, 'id' | 'timestamp'>) =>
    set((state: DentalStore) => ({
      cases: state.cases.map((c: Case) =>
        c.id === caseId
          ? {
              ...c,
              comments: [
                ...c.comments,
                {
                  ...comment,
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: new Date().toISOString(),
                },
              ],
              timeline: [
                ...c.timeline,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  status: 'CommentAdded',
                  description: 'Added a new comment',
                  timestamp: new Date().toISOString(),
                  author: comment.sender
                }
              ]
            }
          : c
      ),
    })),
  addAnnotation: (caseId: string, annotation: Omit<Annotation, 'id' | 'timestamp'>) =>
    set((state: DentalStore) => ({
      cases: state.cases.map((c: Case) =>
        c.id === caseId
          ? {
              ...c,
              annotations: [
                ...c.annotations,
                {
                  ...annotation,
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: new Date().toISOString(),
                  resolved: false
                },
              ],
            }
          : c
      ),
    })),
  resolveAnnotation: (caseId: string, annotationId: string) =>
    set((state: DentalStore) => ({
      cases: state.cases.map((c: Case) =>
        c.id === caseId
          ? {
              ...c,
              annotations: c.annotations.map(a => a.id === annotationId ? { ...a, resolved: true } : a)
            }
          : c
      )
    })),
  markNotificationRead: (id: string) =>
    set((state: DentalStore) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),
  addTimelineEvent: (caseId: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) =>
    set((state: DentalStore) => ({
      cases: state.cases.map((c: Case) =>
        c.id === caseId
          ? {
              ...c,
              timeline: [
                ...c.timeline,
                {
                  ...event,
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: new Date().toISOString(),
                }
              ]
            }
          : c
      )
    }))
}));

