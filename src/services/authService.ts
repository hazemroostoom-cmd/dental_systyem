import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, FirestoreUser } from '@/types';

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign up new user
  static async signUp(
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    await updateProfile(userCredential.user, { displayName: name });

    // Create user document in Firestore
    const userData: Omit<FirestoreUser, 'id'> = {
      email,
      name,
      role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    return userCredential;
  }

  // Sign out
  static async signOut(): Promise<void> {
    return signOut(auth);
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  }

  // Get current user data from Firestore
  static async getCurrentUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Omit<FirestoreUser, 'id'>;
        return {
          id: uid,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<void> {
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;

    await updateDoc(doc(db, 'users', uid), updateData);

    // Update Firebase Auth profile if name changed
    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.name });
    }
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);

      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<FirestoreUser, 'id'>;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Get users by role
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(usersQuery);

      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<FirestoreUser, 'id'>;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      });
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Check if user has required role
  static hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  // Check if user is admin
  static isAdmin(role: UserRole): boolean {
    return role === 'admin';
  }

  // Check if user can access case
  static canAccessCase(userId: string, userRole: UserRole, caseDentistId: string, caseTechnicianId?: string): boolean {
    if (userRole === 'admin') return true;
    if (userRole === 'dentist' && caseDentistId === userId) return true;
    if (userRole === 'technician' && caseTechnicianId === userId) return true;
    if (userRole === 'lab_manager') return true; // Lab managers can access all cases
    return false;
  }
}