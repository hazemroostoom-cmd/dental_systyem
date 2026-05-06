import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { CaseFile, FirestoreCaseFile, UploadTask as UploadTaskType } from '@/types';

export class StorageService {
  private static readonly CASE_FILES_COLLECTION = 'caseFiles';

  // Upload file to Firebase Storage
  static async uploadFile(
    file: File,
    caseId: string,
    type: 'model' | 'image' | 'pdf',
    onProgress?: (progress: number) => void,
    onComplete?: (downloadURL: string, storagePath: string) => void,
    onError?: (error: Error) => void
  ): Promise<UploadTask> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storagePath = `cases/${caseId}/${type}s/${fileName}`;

      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on('state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          onError?.(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save file metadata to Firestore
            const fileData: Omit<FirestoreCaseFile, 'id'> = {
              name: file.name,
              url: downloadURL,
              storagePath,
              type,
              size: file.size,
              version: 1,
              uploadedAt: Timestamp.now(),
              uploadedBy: 'current-user-id', // This should be passed from auth context
              metadata: {
                contentType: file.type,
                originalName: file.name,
              },
            };

            const docRef = await setDoc(doc(collection(db, this.CASE_FILES_COLLECTION)), {
              ...fileData,
              caseId,
            });

            onComplete?.(downloadURL, storagePath);
          } catch (error) {
            console.error('Error saving file metadata:', error);
            onError?.(error as Error);
          }
        }
      );

      return uploadTask;
    } catch (error) {
      console.error('Error starting upload:', error);
      throw error;
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(
    files: File[],
    caseId: string,
    type: 'model' | 'image' | 'pdf',
    onProgress?: (fileIndex: number, progress: number) => void,
    onComplete?: (results: { file: File; downloadURL: string; storagePath: string }[]) => void,
    onError?: (file: File, error: Error) => void
  ): Promise<void> {
    const results: { file: File; downloadURL: string; storagePath: string }[] = [];
    const promises = files.map((file, index) =>
      new Promise<void>((resolve, reject) => {
        this.uploadFile(
          file,
          caseId,
          type,
          (progress) => onProgress?.(index, progress),
          (downloadURL, storagePath) => {
            results.push({ file, downloadURL, storagePath });
            resolve();
          },
          (error) => {
            onError?.(file, error);
            reject(error);
          }
        );
      })
    );

    try {
      await Promise.all(promises);
      onComplete?.(results);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  // Get files for a case
  static async getCaseFiles(caseId: string): Promise<CaseFile[]> {
    try {
      const q = query(
        collection(db, this.CASE_FILES_COLLECTION),
        where('caseId', '==', caseId)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<FirestoreCaseFile, 'id'> & { caseId: string };
        return {
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting case files:', error);
      return [];
    }
  }

  // Delete file
  static async deleteFile(fileId: string, storagePath: string): Promise<void> {
    try {
      // Delete from Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, this.CASE_FILES_COLLECTION, fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get file metadata
  static async getFileMetadata(fileId: string): Promise<CaseFile | null> {
    try {
      const docRef = doc(db, this.CASE_FILES_COLLECTION, fileId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<FirestoreCaseFile, 'id'> & { caseId: string };
        return {
          id: docSnap.id,
          ...data,
          uploadedAt: data.uploadedAt.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }

  // Validate file before upload
  static validateFile(file: File, type: 'model' | 'image' | 'pdf'): { valid: boolean; error?: string } {
    const maxSizes = {
      model: 100 * 1024 * 1024, // 100MB for 3D models
      image: 10 * 1024 * 1024,  // 10MB for images
      pdf: 25 * 1024 * 1024,    // 25MB for PDFs
    };

    const allowedTypes = {
      model: ['model/obj', 'application/octet-stream', 'model/stl', 'model/gltf+json'],
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      pdf: ['application/pdf'],
    };

    // Check file size
    if (file.size > maxSizes[type]) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size (${maxSizes[type] / (1024 * 1024)}MB)`,
      };
    }

    // Check file type
    if (!allowedTypes[type].includes(file.type)) {
      // Additional check for file extensions (some files might not have proper MIME types)
      const extension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = {
        model: ['obj', 'stl', 'gltf', 'glb'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        pdf: ['pdf'],
      };

      if (!allowedExtensions[type].includes(extension || '')) {
        return {
          valid: false,
          error: `Invalid file type. Allowed types: ${allowedExtensions[type].join(', ')}`,
        };
      }
    }

    return { valid: true };
  }

  // Get storage usage for a case
  static async getCaseStorageUsage(caseId: string): Promise<{ totalSize: number; fileCount: number }> {
    try {
      const files = await this.getCaseFiles(caseId);
      return {
        totalSize: files.reduce((total, file) => total + file.size, 0),
        fileCount: files.length,
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { totalSize: 0, fileCount: 0 };
    }
  }

  // Clean up orphaned files (files without case reference)
  static async cleanupOrphanedFiles(): Promise<void> {
    try {
      // This would be a maintenance function to clean up files
      // Implementation depends on your specific cleanup requirements
      console.log('Cleanup function - implement based on your needs');
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
    }
  }

  // Generate signed URL for secure access (if needed)
  static async getSignedURL(storagePath: string, expiresIn: number = 3600): Promise<string> {
    // Firebase Storage doesn't have built-in signed URLs like AWS S3
    // But you can implement custom logic if needed
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
  }

  // List all files in a case folder
  static async listCaseFiles(caseId: string, type?: 'model' | 'image' | 'pdf'): Promise<string[]> {
    try {
      const folderPath = type ? `cases/${caseId}/${type}s/` : `cases/${caseId}/`;
      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);
      return result.items.map(item => item.fullPath);
    } catch (error) {
      console.error('Error listing case files:', error);
      return [];
    }
  }
}