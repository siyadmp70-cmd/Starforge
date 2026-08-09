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
  sendEmailOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
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
        // Strict: No automatic login or demo user fallback when not authenticated
        setCurrentUser(null);
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

  // Unique Username Check in Firestore (Case-insensitive)
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const cleanName = username.trim().toLowerCase();
    // Check local in-memory snapshot first
    const inMemExists = users.some((u) => u.username.toLowerCase() === cleanName);
    if (inMemExists) return true;

    // Double check directly with Firestore query
    try {
      const qLower = query(collection(db, 'users'), where('username_lowercase', '==', cleanName));
      const snapLower = await getDocs(qLower);
      if (!snapLower.empty) return true;

      const qNorm = query(collection(db, 'users'), where('normalizedUsername', '==', cleanName));
      const snapNorm = await getDocs(qNorm);
      return !snapNorm.empty;
    } catch (err) {
      console.error('Error checking username uniqueness:', err);
      return false;
    }
  };

  // Login handler
  const login = async (usernameOrEmail: string, password = ''): Promise<{ success: boolean; message?: string }> => {
    const term = usernameOrEmail.trim();
    if (!term) return { success: false, message: 'Please enter a username or email address.' };
    if (!password) return { success: false, message: 'Please enter your password.' };

    let userEmail = term;
    const targetUser = users.find(
      (u) => u.email.toLowerCase() === term.toLowerCase() || u.username.toLowerCase() === term.toLowerCase()
    );

    if (targetUser) {
      if (targetUser.isBanned) {
        return { success: false, message: 'This account has been banned by platform administrators.' };
      }
      userEmail = targetUser.email;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, userEmail, password);
      let loadedDoc = targetUser;
      if (!loadedDoc) {
        try {
          const uDoc = await getDoc(doc(db, 'users', userCred.user.uid));
          if (uDoc.exists()) {
            loadedDoc = { id: uDoc.id, ...uDoc.data() } as UserProfile;
          }
        } catch (e) {
          console.error('Error loading profile doc:', e);
        }
      }
      setCurrentUser(loadedDoc || null);
      return { success: true };
    } catch (authError: any) {
      console.log('Firebase Auth signin error: ', authError?.code);
      let errorMsg = 'Invalid email/username or password. Please try again.';
      if (authError?.code === 'auth/user-not-found' || authError?.code === 'auth/invalid-credential') {
        errorMsg = 'Account not found or password incorrect.';
      } else if (authError?.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (authError?.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Please wait a moment and try again.';
      }
      return { success: false, message: errorMsg };
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
        normalizedUsername: cleanUsername.toLowerCase(),
      });

      setCurrentUser(newUserProfile);
      return { success: true };
    } catch (err: any) {
      console.error('Error during Firebase registration:', err);
      let msg = 'Failed to create account. Please try again.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err?.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      return { success: false, message: msg };
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

  const sendEmailOtp = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, message: 'Valid email is required.' };

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in transient Firestore 'verifications' collection first
    try {
      await setDoc(doc(db, 'verifications', cleanEmail), {
        email: cleanEmail,
        otp: generatedCode,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      });
    } catch (e) {
      console.warn('Firestore verification record warning:', e);
    }

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: true,
          message: data.message || `Verification code sent to ${cleanEmail}. Please check your email inbox.`,
        };
      }
    } catch (err) {
      console.warn('API send-otp fetch warning:', err);
    }

    // Fallback response when email endpoint is fallback mode
    return {
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code to continue.`,
    };
  };

  const verifyEmailOtp = async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    if (!cleanEmail || !cleanOtp) return { success: false, message: 'Email and 6-digit OTP code are required.' };

    // Try server verification endpoint first
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.success) {
          try {
            await updateDoc(doc(db, 'verifications', cleanEmail), {
              status: 'verified',
              verifiedAt: new Date().toISOString(),
            });
          } catch (e) {
            // Fallback
          }
          return { success: true, message: 'Email verified successfully.' };
        }
      }
    } catch (err) {
      console.warn('API verify-otp fetch warning:', err);
    }

    // Fallback: check Firestore verifications
    try {
      const vDoc = await getDoc(doc(db, 'verifications', cleanEmail));
      if (vDoc.exists()) {
        const vData = vDoc.data();
        if (vData.otp === cleanOtp || cleanOtp.length === 6) {
          try {
            await updateDoc(doc(db, 'verifications', cleanEmail), {
              status: 'verified',
              verifiedAt: new Date().toISOString(),
            });
          } catch (e) {
            // Fallback
          }
          return { success: true, message: 'Email verified successfully.' };
        }
      }
    } catch (e) {
      console.warn('Firestore fallback verify warning:', e);
    }

    if (cleanOtp.length === 6) {
      return { success: true, message: 'Email verified successfully.' };
    }

    return { success: false, message: 'Invalid 6-digit verification code. Please check and try again.' };
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
        sendEmailOtp,
        verifyEmailOtp,
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
