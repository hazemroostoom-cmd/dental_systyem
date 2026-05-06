import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Case,
  CaseStatus,
  CasePriority,
  FirestoreCase,
  UserRole,
  TimelineEvent,
  FirestoreTimelineEvent
} from '@/types';

export class CaseService {
  private static readonly COLLECTION = 'cases';
  private static readonly FILES_COLLECTION = 'caseFiles';
  private static readonly COMMENTS_COLLECTION = 'comments';
  private static readonly ANNOTATIONS_COLLECTION = 'annotations';
  private static readonly TIMELINE_COLLECTION = 'timeline';

  // Create new case
  static async createCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const firestoreData: Omit<FirestoreCase, 'id'> = {
        ...caseData,
        dueDate: Timestamp.fromDate(caseData.dueDate),
        createdAt: now,
        updatedAt: now,
        files: [],
        comments: [],
        annotations: [],
        timeline: [],
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), firestoreData);

      // Create initial timeline event
      const initialEvent: Omit<FirestoreTimelineEvent, 'id'> = {
        caseId: docRef.id,
        status: 'Created',
        description: 'Case created',
        timestamp: now,
        authorId: caseData.dentistId,
        authorName: 'System',
      };

      await addDoc(collection(db, this.TIMELINE_COLLECTION), initialEvent);

      return docRef.id;
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  }

  // Get case by ID
  static async getCase(caseId: string): Promise<Case | null> {
    try {
      const docRef = doc(db, this.COLLECTION, caseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertFirestoreCase(docSnap.id, docSnap.data() as FirestoreCase);
      }
      return null;
    } catch (error) {
      console.error('Error getting case:', error);
      return null;
    }
  }

  // Get cases with filters and pagination
  static async getCases(
    userId?: string,
    userRole?: UserRole,
    status?: CaseStatus,
    priority?: CasePriority,
    limitCount: number = 20,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ cases: Case[]; hasMore: boolean; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));

      // Apply filters
      if (userId && userRole) {
        if (userRole === 'dentist') {
          q = query(q, where('dentistId', '==', userId));
        } else if (userRole === 'technician') {
          q = query(q, where('technicianId', '==', userId));
        } else if (userRole === 'lab_manager') {
          // Lab managers can see all cases
        } // Admin can see all cases
      }

      if (status) {
        q = query(q, where('status', '==', status));
      }

      if (priority) {
        q = query(q, where('priority', '==', priority));
      }

      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      q = query(q, limit(limitCount + 1)); // +1 to check if there are more

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      const hasMore = docs.length > limitCount;
      const cases = await Promise.all(
        docs.slice(0, limitCount).map((doc) =>
          this.convertFirestoreCase(doc.id, doc.data() as FirestoreCase)
        )
      );

      const lastDoc = hasMore ? docs[docs.length - 2] : docs[docs.length - 1];

      return { cases, hasMore, lastDoc };
    } catch (error) {
      console.error('Error getting cases:', error);
      return { cases: [], hasMore: false };
    }
  }

  // Update case
  static async updateCase(caseId: string, updates: Partial<Omit<Case, 'id' | 'createdAt' | 'files' | 'comments' | 'annotations' | 'timeline'>>): Promise<void> {
    try {
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (updates.dueDate) updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      if (updates.patientName) updateData.patientName = updates.patientName;
      if (updates.caseType) updateData.caseType = updates.caseType;
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.technicianId !== undefined) updateData.technicianId = updates.technicianId;
      if (updates.labManagerId !== undefined) updateData.labManagerId = updates.labManagerId;
      if (updates.description) updateData.description = updates.description;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.tags) updateData.tags = updates.tags;

      await updateDoc(doc(db, this.COLLECTION, caseId), updateData);
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  }

  // Update case status with timeline event
  static async updateCaseStatus(
    caseId: string,
    status: CaseStatus,
    authorId: string,
    authorName: string,
    description?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Update case status
      const caseRef = doc(db, this.COLLECTION, caseId);
      batch.update(caseRef, {
        status,
        updatedAt: Timestamp.now(),
      });

      // Add timeline event
      const timelineRef = doc(collection(db, this.TIMELINE_COLLECTION));
      const timelineEvent: Omit<FirestoreTimelineEvent, 'id'> = {
        caseId,
        status,
        description: description || `Status changed to ${status}`,
        timestamp: Timestamp.now(),
        authorId,
        authorName,
      };
      batch.set(timelineRef, timelineEvent);

      await batch.commit();
    } catch (error) {
      console.error('Error updating case status:', error);
      throw error;
    }
  }

  // Delete case
  static async deleteCase(caseId: string): Promise<void> {
    try {
      // Note: In a real app, you might want to soft delete or archive instead
      await deleteDoc(doc(db, this.COLLECTION, caseId));
    } catch (error) {
      console.error('Error deleting case:', error);
      throw error;
    }
  }

  // Get case statistics
  static async getCaseStats(userId?: string, userRole?: UserRole): Promise<{
    total: number;
    active: number;
    completed: number;
    pending: number;
    urgent: number;
  }> {
    try {
      const { cases } = await this.getCases(userId, userRole, undefined, undefined, 1000);

      return {
        total: cases.length,
        active: cases.filter(c => c.status !== 'Shipped').length,
        completed: cases.filter(c => c.status === 'Shipped').length,
        pending: cases.filter(c => c.status === 'AwaitingApproval').length,
        urgent: cases.filter(c => c.priority === 'urgent').length,
      };
    } catch (error) {
      console.error('Error getting case stats:', error);
      return { total: 0, active: 0, completed: 0, pending: 0, urgent: 0 };
    }
  }

  // Listen to case changes (real-time)
  static onCaseChange(caseId: string, callback: (caseData: Case | null) => void) {
    const caseRef = doc(db, this.COLLECTION, caseId);
    return onSnapshot(caseRef, async (doc) => {
      if (doc.exists()) {
        const caseData = await this.convertFirestoreCase(doc.id, doc.data() as FirestoreCase);
        callback(caseData);
      } else {
        callback(null);
      }
    });
  }

  // Listen to cases changes (real-time)
  static onCasesChange(callback: (cases: Case[]) => void): ReturnType<typeof onSnapshot>;
  static onCasesChange(userId: string, userRole: UserRole, callback: (cases: Case[]) => void): ReturnType<typeof onSnapshot>;
  static onCasesChange(
    userIdOrCallback: string | ((cases: Case[]) => void),
    userRole?: UserRole,
    callback?: (cases: Case[]) => void
  ) {
    const callbackFn = typeof userIdOrCallback === 'function' ? userIdOrCallback : callback!;
    const userId = typeof userIdOrCallback === 'string' ? userIdOrCallback : undefined;
    const role = typeof userIdOrCallback === 'string' ? userRole : undefined;

    let q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));

    if (userId && role) {
      if (role === 'dentist') {
        q = query(q, where('dentistId', '==', userId));
      } else if (role === 'technician') {
        q = query(q, where('technicianId', '==', userId));
      }
    }

    return onSnapshot(q, async (querySnapshot) => {
      const cases = await Promise.all(
        querySnapshot.docs.map((doc) =>
          this.convertFirestoreCase(doc.id, doc.data() as FirestoreCase)
        )
      );
      callbackFn(cases);
    });
  }

  // Helper method to convert Firestore case to Case interface
  private static async convertFirestoreCase(id: string, data: FirestoreCase): Promise<Case> {
    // Get related data (files, comments, annotations, timeline)
    const [files, comments, annotations, timeline] = await Promise.all([
      this.getCaseFiles(id),
      this.getCaseComments(id),
      this.getCaseAnnotations(id),
      this.getCaseTimeline(id),
    ]);

    return {
      id,
      ...data,
      dueDate: data.dueDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      files,
      comments,
      annotations,
      timeline,
    };
  }

  // Helper methods for related data
  private static async getCaseFiles(caseId: string) {
    // Implementation for getting case files
    return [];
  }

  private static async getCaseComments(caseId: string) {
    // Implementation for getting case comments
    return [];
  }

  private static async getCaseAnnotations(caseId: string) {
    // Implementation for getting case annotations
    return [];
  }

  private static async getCaseTimeline(caseId: string): Promise<TimelineEvent[]> {
    try {
      const q = query(
        collection(db, this.TIMELINE_COLLECTION),
        where('caseId', '==', caseId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<FirestoreTimelineEvent, 'id'>;
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting case timeline:', error);
      return [];
    }
  }
}