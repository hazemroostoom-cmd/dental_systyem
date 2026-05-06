import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User, Case, CaseStatus, Comment, Annotation, Notification, UploadTask } from '../types';
import { AuthService } from '../services/authService';
import { CaseService } from '../services/caseService';
import { StorageService } from '../services/storageService';

interface DentalStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string;

  // Cases state
  cases: Case[];
  activeCaseId: string | null;
  casesLoading: boolean;

  // UI state
  notifications: Notification[];
  uploadTasks: UploadTask[];

  // Auth state
  setAuthError: (error: string) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loadUserData: () => Promise<void>;

  // Case actions
  setActiveCase: (id: string | null) => void;
  loadCases: () => Promise<void>;
  createCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => Promise<string>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<void>;
  updateCaseStatus: (id: string, status: CaseStatus) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;

  // Comment actions
  addComment: (caseId: string, text: string) => Promise<void>;

  // Annotation actions
  addAnnotation: (caseId: string, annotation: Omit<Annotation, 'id' | 'timestamp' | 'caseId'>) => Promise<void>;
  resolveAnnotation: (caseId: string, annotationId: string) => Promise<void>;

  // File upload actions
  uploadFiles: (files: File[], caseId: string, type: 'model' | 'image' | 'pdf') => Promise<void>;
  removeUploadTask: (taskId: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;

  // Utility actions
  initializeStore: () => void;
}

export const useDentalStore = create<DentalStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: true,
    cases: [],
    activeCaseId: null,
    casesLoading: false,
    notifications: [],
    uploadTasks: [],
    authError: '',

    // Auth actions
    setAuthError: (error: string) => set({ authError: error }),

    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true, authError: '' });
        await AuthService.signIn(email, password);
        // User data will be loaded by the auth state listener
      } catch (error: any) {
        console.error('Login error:', error);
        const message = error?.message || 'Authentication failed';
        set({ authError: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    signup: async (email: string, password: string, name: string, role: User['role']) => {
      try {
        set({ isLoading: true, authError: '' });
        await AuthService.signUp(email, password, name, role);
        // User data will be loaded by the auth state listener
      } catch (error: any) {
        console.error('Signup error:', error);
        const message = error?.message || 'Authentication failed';
        set({ authError: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      try {
        await AuthService.signOut();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authError: '',
          cases: [],
          activeCaseId: null,
          notifications: [],
          uploadTasks: [],
        });
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },

    resetPassword: async (email: string) => {
      try {
        await AuthService.resetPassword(email);
      } catch (error) {
        console.error('Reset password error:', error);
        throw error;
      }
    },

    loadUserData: async () => {
      try {
        const { user } = get();
        if (user?.id) {
          const userData = await AuthService.getCurrentUserData(user.id);
          if (userData) {
            set({ user: userData, isAuthenticated: true });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },

    // Case actions
    setActiveCase: (id: string | null) => set({ activeCaseId: id }),

    loadCases: async () => {
      try {
        const { user } = get();
        set({ casesLoading: true });

        const { cases } = await CaseService.getCases(
          user?.id,
          user?.role,
          undefined,
          undefined,
          50
        );

        set({ cases, casesLoading: false });
      } catch (error) {
        console.error('Error loading cases:', error);
        set({ casesLoading: false });
      }
    },

    createCase: async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => {
      try {
        const caseId = await CaseService.createCase(caseData);
        await get().loadCases(); // Reload cases
        return caseId;
      } catch (error) {
        console.error('Error creating case:', error);
        throw error;
      }
    },

    updateCase: async (id: string, updates: Partial<Case>) => {
      try {
        await CaseService.updateCase(id, updates);
        await get().loadCases(); // Reload cases
      } catch (error) {
        console.error('Error updating case:', error);
        throw error;
      }
    },

    updateCaseStatus: async (id: string, status: CaseStatus) => {
      try {
        const { user } = get();
        if (user) {
          await CaseService.updateCaseStatus(
            id,
            status,
            user.id,
            user.name,
            `Status changed to ${status}`
          );
          await get().loadCases(); // Reload cases
        }
      } catch (error) {
        console.error('Error updating case status:', error);
        throw error;
      }
    },

    deleteCase: async (id: string) => {
      try {
        await CaseService.deleteCase(id);
        await get().loadCases(); // Reload cases
      } catch (error) {
        console.error('Error deleting case:', error);
        throw error;
      }
    },

    // Comment actions
    addComment: async (caseId: string, text: string) => {
      try {
        const { user } = get();
        if (user) {
          // Implementation for adding comments
          console.log('Add comment:', { caseId, text, user });
          // TODO: Implement comment service
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    },

    // Annotation actions
    addAnnotation: async (caseId: string, annotation: Omit<Annotation, 'id' | 'timestamp' | 'caseId'>) => {
      try {
        const { user } = get();
        if (user) {
          // Implementation for adding annotations
          console.log('Add annotation:', { caseId, annotation, user });
          // TODO: Implement annotation service
        }
      } catch (error) {
        console.error('Error adding annotation:', error);
        throw error;
      }
    },

    resolveAnnotation: async (caseId: string, annotationId: string) => {
      try {
        // Implementation for resolving annotations
        console.log('Resolve annotation:', { caseId, annotationId });
        // TODO: Implement annotation service
      } catch (error) {
        console.error('Error resolving annotation:', error);
        throw error;
      }
    },

    // File upload actions
    uploadFiles: async (files: File[], caseId: string, type: 'model' | 'image' | 'pdf') => {
      try {
        const uploadPromises = files.map(async (file, index) => {
          const taskId = `upload_${Date.now()}_${index}`;

          // Add upload task to state
          const uploadTask: UploadTask = {
            id: taskId,
            file,
            caseId,
            type,
            progress: 0,
            status: 'pending',
          };

          set(state => ({
            uploadTasks: [...state.uploadTasks, uploadTask],
          }));

          // Validate file
          const validation = StorageService.validateFile(file, type);
          if (!validation.valid) {
            set(state => ({
              uploadTasks: state.uploadTasks.map(task =>
                task.id === taskId
                  ? { ...task, status: 'error', error: validation.error }
                  : task
              ),
            }));
            return;
          }

          // Start upload
          set(state => ({
            uploadTasks: state.uploadTasks.map(task =>
              task.id === taskId ? { ...task, status: 'uploading' } : task
            ),
          }));

          await StorageService.uploadFile(
            file,
            caseId,
            type,
            (progress) => {
              set(state => ({
                uploadTasks: state.uploadTasks.map(task =>
                  task.id === taskId ? { ...task, progress } : task
                ),
              }));
            },
            (downloadURL, storagePath) => {
              set(state => ({
                uploadTasks: state.uploadTasks.map(task =>
                  task.id === taskId
                    ? { ...task, status: 'completed', downloadURL, storagePath }
                    : task
                ),
              }));
            },
            (error) => {
              set(state => ({
                uploadTasks: state.uploadTasks.map(task =>
                  task.id === taskId
                    ? { ...task, status: 'error', error: error.message }
                    : task
                ),
              }));
            }
          );
        });

        await Promise.allSettled(uploadPromises);

        // Reload cases to get updated file lists
        await get().loadCases();
      } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
      }
    },

    removeUploadTask: (taskId: string) => {
      set(state => ({
        uploadTasks: state.uploadTasks.filter(task => task.id !== taskId),
      }));
    },

    // Notification actions
    markNotificationRead: (id: string) => {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
      }));
    },

    addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}`,
        createdAt: new Date(),
      };

      set(state => ({
        notifications: [newNotification, ...state.notifications],
      }));
    },

    // Initialize store and set up listeners
    initializeStore: () => {
      // Listen to auth state changes
      AuthService.onAuthStateChange(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
            if (userData) {
              set({ user: userData, isAuthenticated: true, isLoading: false, authError: '' });
              get().loadCases();
              return;
            }

            const fallbackUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
              role: 'dentist',
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
            };

            set({
              user: fallbackUser,
              isAuthenticated: true,
              isLoading: false,
              authError: 'Signed in, but profile data is unavailable. Firestore may be disabled or unreachable.',
            });
            get().loadCases();
          } catch (error: any) {
            console.error('Error getting user data:', error);
            const fallbackUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
              role: 'dentist',
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
            };

            set({
              user: fallbackUser,
              isAuthenticated: true,
              isLoading: false,
              authError: 'Signed in, but unable to load profile data. Firestore may be disabled or unreachable.',
            });
            get().loadCases();
          }
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authError: '',
            cases: [],
            activeCaseId: null,
            notifications: [],
            uploadTasks: [],
          });
        }
      });
    },
  }))
);

