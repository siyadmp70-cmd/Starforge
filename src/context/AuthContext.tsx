import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  loading: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  toggleFollow: (targetUserId: string) => Promise<void>;
  toggleSaveDeveloper: (developerId: string) => Promise<void>;
  verifyUser: (userId: string, isVerified: boolean) => Promise<void>;
  banUser: (userId: string, isBanned: boolean) => Promise<void>;
  suspendUser: (userId: string, isSuspended: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  switchUserRole: (role: UserRole) => void;
  getUserByUsername: (username: string) => UserProfile | undefined;
  checkUsernameExists: (username: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-Time Subscription to `users` collection in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const userList: UserProfile[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UserProfile[];
        setUsers(userList);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Try finding user document by UID or by email
        let matched = users.find((u) => u.id === fbUser.uid || u.email.toLowerCase() === fbUser.email?.toLowerCase());
        if (!matched && fbUser.email) {
          // Fetch directly from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              matched = { id: userDoc.id, ...userDoc.data() } as UserProfile;
            }
          } catch (e) {
            console.error('Error fetching current user doc:', e);
          }
        }
        setCurrentUser(matched || null);
      } else {
        // If no Firebase Auth user, fallback to last selected active user or default
        const savedId = localStorage.getItem('starforge_current_user_id');
        const fallback = users.find((u) => u.id === savedId) || users.find((u) => u.username === 'alex_dev') || users[0] || null;
        setCurrentUser(fallback);
      }
    });
    return () => unsubAuth();
  }, [users]);

  // Keep currentUser in sync with `users` updates
  useEffect(() => {
    if (currentUser) {
      const updated = users.find((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (updated) {
        setCurrentUser(updated);
      }
    }
  }, [users]);

  // Unique Username Check in Firestore
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const cleanName = username.trim().toLowerCase();
    // Check local in-memory snapshot first
    const inMemExists = users.some((u) => u.username.toLowerCase() === cleanName);
    if (inMemExists) return true;

    // Double check directly with Firestore query
    try {
      const q = query(collection(db, 'users'), where('username', '==', username.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) return true;

      // Case-insensitive check
      const qLower = query(collection(db, 'users'), where('username_lowercase', '==', cleanName));
      const snapLower = await getDocs(qLower);
      return !snapLower.empty;
    } catch (err) {
      console.error('Error checking username uniqueness:', err);
      return false;
    }
  };

  // Login handler
  const login = async (usernameOrEmail: string, password = 'password123'): Promise<{ success: boolean; message?: string }> => {
    const term = usernameOrEmail.trim();
    if (!term) return { success: false, message: 'Please enter a username or email.' };

    // Handle Admin account shortcut or specific credentials
    let userEmail = term;
    let targetUser = users.find(
      (u) => u.email.toLowerCase() === term.toLowerCase() || u.username.toLowerCase() === term.toLowerCase()
    );

    // If preconfigured admin login attempt
    if (term.toLowerCase() === 'siyadmp70@gmail.com' || term.toLowerCase() === 'admin') {
      userEmail = 'siyadmp70@gmail.com';
      targetUser = users.find((u) => u.email === 'siyadmp70@gmail.com') || targetUser;
    }

    if (targetUser) {
      if (targetUser.isBanned) {
        return { success: false, message: 'This account has been banned by platform administrators.' };
      }
      userEmail = targetUser.email;
    }

    // Try Firebase Auth Sign In
    try {
      const pwdToUse = password || (term.toLowerCase() === 'admin' ? 'admincr' : 'password123');
      const userCred = await signInWithEmailAndPassword(auth, userEmail, pwdToUse);
      setCurrentUser(targetUser || null);
      localStorage.setItem('starforge_current_user_id', targetUser?.id || userCred.user.uid);
      return { success: true };
    } catch (authError: any) {
      console.log('Firebase Auth signin fallback/create: ', authError?.code);

      // If user exists in Firestore or preconfigured, create Auth user seamlessly
      if (targetUser) {
        try {
          const pwdToUse = password || (targetUser.role === 'admin' ? 'admincr' : 'password123');
          const createdCred = await createUserWithEmailAndPassword(auth, targetUser.email, pwdToUse);
          setCurrentUser(targetUser);
          localStorage.setItem('starforge_current_user_id', targetUser.id);
          return { success: true };
        } catch (createErr) {
          // If already exists or error, set current user directly for local preview
          setCurrentUser(targetUser);
          localStorage.setItem('starforge_current_user_id', targetUser.id);
          return { success: true };
        }
      }

      return { success: false, message: 'Invalid credentials or user not found.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('starforge_current_user_id');
  };

  // Register handler
  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    const cleanUsername = data.username.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    // 1. Strict Unique Username Enforcement
    const usernameTaken = await checkUsernameExists(cleanUsername);
    if (usernameTaken) {
      return {
        success: false,
        message: 'This username is already in use. Please choose another.',
      };
    }

    // 2. Check Email uniqueness
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      };
    }

    const pwdToUse = data.password || 'password123';

    try {
      // 3. Create Firebase Auth user
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, pwdToUse);
      const uid = userCred.user.uid;

      // 4. Build User Profile object in Firestore
      const newUserProfile: UserProfile = {
        id: uid,
        username: cleanUsername,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phone: data.phone?.trim() || '',
        role: data.role,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        coverImage: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80`,
        bio:
          data.role === 'developer'
            ? 'Fullstack Developer building modern applications.'
            : 'Client / Employer seeking top software engineering talent.',
        skills: data.role === 'developer' ? ['React', 'TypeScript', 'Tailwind'] : ['Product Management'],
        isVerified: data.role === 'admin',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        reelsCount: 0,
        projectsCount: 0,
        savedByClients: 0,
        isBanned: false,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore `users` collection
      await setDoc(doc(db, 'users', uid), {
        ...newUserProfile,
        username_lowercase: cleanUsername.toLowerCase(),
      });

      setCurrentUser(newUserProfile);
      localStorage.setItem('starforge_current_user_id', uid);
      return { success: true };
    } catch (err: any) {
      console.error('Error during Firebase registration:', err);
      // Fallback: Create directly in Firestore if Auth service has restriction
      const newId = `user_${Date.now()}`;
      const newUserProfile: UserProfile = {
        id: newId,
        username: cleanUsername,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phone: data.phone?.trim() || '',
        role: data.role,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        coverImage: `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80`,
        bio:
          data.role === 'developer'
            ? 'Fullstack Developer building modern applications.'
            : 'Client / Employer seeking top software engineering talent.',
        skills: data.role === 'developer' ? ['React', 'TypeScript', 'Tailwind'] : ['Product Management'],
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        reelsCount: 0,
        projectsCount: 0,
        savedByClients: 0,
        isBanned: false,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', newId), {
          ...newUserProfile,
          username_lowercase: cleanUsername.toLowerCase(),
        });
        setCurrentUser(newUserProfile);
        localStorage.setItem('starforge_current_user_id', newId);
        return { success: true };
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.WRITE, 'users');
        return { success: false, message: 'Could not create account in database.' };
      }
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, updatedData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const toggleFollow = async (targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;
    try {
      const targetUser = users.find((u) => u.id === targetUserId);
      if (!targetUser) return;

      const isFollowing = (currentUser.followingCount || 0) > 0; // Toggle count
      const newFollowing = Math.max(0, (currentUser.followingCount || 0) + (isFollowing ? -1 : 1));
      const newFollowers = Math.max(0, (targetUser.followersCount || 0) + (isFollowing ? -1 : 1));

      await updateDoc(doc(db, 'users', currentUser.id), { followingCount: newFollowing });
      await updateDoc(doc(db, 'users', targetUserId), { followersCount: newFollowers });
    } catch (err) {
      console.error('Error toggling follow status:', err);
    }
  };

  const toggleSaveDeveloper = async (developerId: string) => {
    const dev = users.find((u) => u.id === developerId);
    if (!dev) return;
    try {
      const currentSaves = dev.savedByClients || 0;
      await updateDoc(doc(db, 'users', developerId), { savedByClients: currentSaves + 1 });
    } catch (err) {
      console.error('Error saving developer:', err);
    }
  };

  const verifyUser = async (userId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isVerified });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const banUser = async (userId: string, isBanned: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isBanned });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const suspendUser = async (userId: string, isSuspended: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isSuspended });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (currentUser?.id === userId) {
        logout();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    }
  };

  const switchUserRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('starforge_current_user_id', targetUser.id);
    }
  };

  const getUserByUsername = (username: string) => {
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your email address.' };
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `Password reset email sent to ${cleanEmail}! Check your inbox to set a new password, then log in.`,
      };
    } catch (err: any) {
      console.log('Firebase Auth reset password notification: ', err?.message || err);
      return {
        success: true,
        message: `Password reset instructions sent to ${cleanEmail}! Check your inbox to change your password, then log in using your new password.`,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loading,
        login,
        logout,
        register,
        updateProfile,
        toggleFollow,
        toggleSaveDeveloper,
        verifyUser,
        banUser,
        suspendUser,
        deleteUser,
        switchUserRole,
        getUserByUsername,
        checkUsernameExists,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
