export type CaseStatus = 'ScanReceived' | 'Design' | 'AwaitingApproval' | 'InProduction' | 'Shipped';
export type UserRole = 'dentist' | 'technician' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Case {
  id: string;
  patientName: string;
  caseType: string;
  status: CaseStatus;
  technician: string;
  dueDate: string;
  createdAt: string;
  description: string;
  files: CaseFile[];
  comments: Comment[];
  annotations: Annotation[];
  timeline: TimelineEvent[];
}

export interface CaseFile {
  id: string;
  name: string;
  url: string;
  type: 'model' | 'image' | 'pdf';
  size: string;
  version: number;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  avatar?: string;
  isOwn?: boolean;
}

export interface Annotation {
  id: string;
  position: [number, number, number];
  text: string;
  author: string;
  timestamp: string;
  resolved?: boolean;
}

export interface TimelineEvent {
  id: string;
  status: CaseStatus | 'Created' | 'CommentAdded' | 'FileUploaded';
  description: string;
  timestamp: string;
  author: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  text: string;
  time: string;
  read: boolean;
  link?: string;
}

