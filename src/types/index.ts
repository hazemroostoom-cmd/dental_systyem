export type CaseStatus = 'ScanReceived' | 'Design' | 'AwaitingApproval' | 'InProduction' | 'Shipped';
export type UserRole = 'admin' | 'dentist' | 'technician' | 'lab_manager';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Case {
  id: string;
  caseId: string; // Human-readable case ID like "CAS-0001"
  patientName: string;
  caseType: string;
  status: CaseStatus;
  priority: CasePriority;
  dentistId: string;
  technicianId?: string;
  labManagerId?: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  notes?: string;
  files: CaseFile[];
  comments: Comment[];
  annotations: Annotation[];
  timeline: TimelineEvent[];
  tags?: string[];
}

export interface CaseFile {
  id: string;
  name: string;
  url: string;
  storagePath: string; // Firebase Storage path
  type: 'model' | 'image' | 'pdf';
  size: number;
  version: number;
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  avatar?: string;
  isEdited?: boolean;
  editedAt?: Date;
}

export interface Annotation {
  id: string;
  caseId: string;
  position: [number, number, number];
  text: string;
  authorId: string;
  authorName: string;
  timestamp: Date;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  status?: CaseStatus | 'Created' | 'CommentAdded' | 'FileUploaded' | 'AnnotationAdded' | 'Assigned';
  description: string;
  timestamp: Date;
  authorId: string;
  authorName: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  metadata?: Record<string, any>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'case' | 'comment' | 'file' | 'annotation' | 'user';
  entityId: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Firestore Collection Types
export interface FirestoreUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

export interface FirestoreCase extends Omit<Case, 'id' | 'dueDate' | 'createdAt' | 'updatedAt' | 'files' | 'comments' | 'annotations' | 'timeline'> {
  dueDate: FirebaseTimestamp;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  files: string[]; // Array of file IDs
  comments: string[]; // Array of comment IDs
  annotations: string[]; // Array of annotation IDs
  timeline: string[]; // Array of timeline event IDs
}

export interface FirestoreCaseFile extends Omit<CaseFile, 'uploadedAt'> {
  uploadedAt: FirebaseTimestamp;
}

export interface FirestoreComment extends Omit<Comment, 'timestamp' | 'editedAt'> {
  timestamp: FirebaseTimestamp;
  editedAt?: FirebaseTimestamp;
}

export interface FirestoreAnnotation extends Omit<Annotation, 'timestamp' | 'resolvedAt'> {
  timestamp: FirebaseTimestamp;
  resolvedAt?: FirebaseTimestamp;
}

export interface FirestoreTimelineEvent extends Omit<TimelineEvent, 'timestamp'> {
  timestamp: FirebaseTimestamp;
}

export interface FirestoreNotification extends Omit<Notification, 'createdAt'> {
  createdAt: FirebaseTimestamp;
}

export interface FirestoreActivityLog extends Omit<ActivityLog, 'timestamp'> {
  timestamp: FirebaseTimestamp;
}

// Firebase specific types
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
  toMillis: () => number;
}

// Upload types
export interface FileUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadTask {
  id: string;
  file: File;
  caseId: string;
  type: 'model' | 'image' | 'pdf';
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  downloadURL?: string;
  storagePath?: string;
}

