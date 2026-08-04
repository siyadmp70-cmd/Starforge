import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Post,
  Reel,
  Message,
  Comment,
  NotificationItem,
  VerificationRequest,
  UserReport,
  AIAnalysisResult,
} from '../types';
import {
  INITIAL_POSTS,
  INITIAL_REELS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_REPORTS,
} from '../data/initialData';
import { useAuth } from './AuthContext';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface SocialContextType {
  posts: Post[];
  reels: Reel[];
  messages: Message[];
  notifications: NotificationItem[];
  verificationRequests: VerificationRequest[];
  reports: UserReport[];
  createPost: (postData: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'createdAt'>) => Promise<void>;
  createReel: (reelData: Omit<Reel, 'id' | 'likesCount' | 'commentsCount' | 'createdAt'>) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleSavePost: (postId: string) => Promise<void>;
  toggleLikeReel: (reelId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  getCommentsForPost: (postId: string) => Comment[];
  sendMessage: (
    receiverId: string,
    text: string,
    imageUrl?: string,
    projectAttachment?: any
  ) => Promise<void>;
  getConversationWithUser: (otherUserId: string) => Message[];
  reactToMessage: (messageId: string, reaction: string) => Promise<void>;
  markMessagesAsRead: (otherUserId: string) => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  submitVerificationRequest: (userId: string) => Promise<void>;
  processVerificationRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  reportUser: (
    reportedUserId: string,
    reportedUsername: string,
    reason: string,
    details: string
  ) => Promise<void>;
  generateAIVerification: (username: string) => Promise<AIAnalysisResult | null>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, verifyUser, updateProfile } = useAuth();

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubPosts = onSnapshot(
      collection(db, 'posts'),
      (snapshot) => {
        const list: Post[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Post[];
        setPosts(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'posts')
    );

    const unsubReels = onSnapshot(
      collection(db, 'reels'),
      (snapshot) => {
        const list: Reel[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Reel[];
        setReels(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'reels')
    );

    const unsubMessages = onSnapshot(
      collection(db, 'messages'),
      (snapshot) => {
        const list: Message[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Message[];
        // Sort chronologically by message ID
        list.sort((a, b) => a.id.localeCompare(b.id));
        setMessages(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'messages')
    );

    const unsubNotifs = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const list: NotificationItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as NotificationItem[];
        setNotifications(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'notifications')
    );

    const unsubVerifs = onSnapshot(
      collection(db, 'verification_requests'),
      (snapshot) => {
        const list: VerificationRequest[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as VerificationRequest[];
        setVerificationRequests(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'verification_requests')
    );

    const unsubReports = onSnapshot(
      collection(db, 'reports'),
      (snapshot) => {
        const list: UserReport[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UserReport[];
        setReports(list);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'reports')
    );

    return () => {
      unsubPosts();
      unsubReels();
      unsubMessages();
      unsubNotifs();
      unsubVerifs();
      unsubReports();
    };
  }, []);

  const createPost = async (postData: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'createdAt'>) => {
    const newId = `post_${Date.now()}`;
    const newPost: Post = {
      ...postData,
      id: newId,
      likesCount: 0,
      commentsCount: 0,
      createdAt: 'Just now',
    };
    try {
      await setDoc(doc(db, 'posts', newId), newPost);

      // Increment author's post count in Firestore
      if (currentUser) {
        const currentPostsCount = currentUser.postsCount || 0;
        await updateProfile({ postsCount: currentPostsCount + 1 });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${newId}`);
    }
  };

  const createReel = async (reelData: Omit<Reel, 'id' | 'likesCount' | 'commentsCount' | 'createdAt'>) => {
    const newId = `reel_${Date.now()}`;
    const newReel: Reel = {
      ...reelData,
      id: newId,
      likesCount: 0,
      commentsCount: 0,
      createdAt: 'Just now',
    };
    try {
      await setDoc(doc(db, 'reels', newId), newReel);

      if (currentUser) {
        const currentReelsCount = currentUser.reelsCount || 0;
        await updateProfile({ reelsCount: currentReelsCount + 1 });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reels/${newId}`);
    }
  };

  const toggleLikePost = async (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const isLiked = targetPost.likedByCurrentUser;
    const newLikesCount = Math.max(0, targetPost.likesCount + (isLiked ? -1 : 1));

    try {
      await updateDoc(doc(db, 'posts', postId), {
        likedByCurrentUser: !isLiked,
        likesCount: newLikesCount,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const toggleSavePost = async (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    try {
      await updateDoc(doc(db, 'posts', postId), {
        savedByCurrentUser: !targetPost.savedByCurrentUser,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const toggleLikeReel = async (reelId: string) => {
    const targetReel = reels.find((r) => r.id === reelId);
    if (!targetReel) return;

    const isLiked = targetReel.likedByCurrentUser;
    const newLikesCount = Math.max(0, targetReel.likesCount + (isLiked ? -1 : 1));

    try {
      await updateDoc(doc(db, 'reels', reelId), {
        likedByCurrentUser: !isLiked,
        likesCount: newLikesCount,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reels/${reelId}`);
    }
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      text: text.trim(),
      createdAt: 'Just now',
    };

    setComments((prev) => [newComment, ...prev]);

    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost) {
      try {
        await updateDoc(doc(db, 'posts', postId), {
          commentsCount: targetPost.commentsCount + 1,
        });
      } catch (e) {
        console.error('Error updating comment count:', e);
      }
    }
  };

  const getCommentsForPost = (postId: string) => {
    return comments.filter((c) => c.postId === postId);
  };

  const sendMessage = async (
    receiverId: string,
    text: string,
    imageUrl?: string,
    projectAttachment?: any
  ) => {
    if (!currentUser) return;

    const msgId = `msg_${Date.now()}`;
    const newMsg: Message = {
      id: msgId,
      senderId: currentUser.id,
      receiverId,
      text,
      imageUrl: imageUrl || '',
      projectAttachment: projectAttachment || null,
      read: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      await setDoc(doc(db, 'messages', msgId), newMsg);

      // Create Notification for recipient in Firestore
      const notifId = `notif_${Date.now()}`;
      const newNotif: NotificationItem = {
        id: notifId,
        userId: receiverId,
        type: 'message',
        fromUsername: currentUser.username,
        fromAvatar: currentUser.avatar,
        text: `sent you a message: "${text.slice(0, 35)}..."`,
        createdAt: 'Just now',
        read: false,
      };
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `messages/${msgId}`);
    }
  };

  const getConversationWithUser = (otherUserId: string) => {
    if (!currentUser) return [];
    return messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === currentUser.id)
    );
  };

  const reactToMessage = async (messageId: string, reaction: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { reaction });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${messageId}`);
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!currentUser) return;
    const unreadMsgs = messages.filter(
      (m) => m.senderId === otherUserId && m.receiverId === currentUser.id && !m.read
    );
    for (const m of unreadMsgs) {
      try {
        await updateDoc(doc(db, 'messages', m.id), { read: true });
      } catch (e) {
        console.error('Error marking message as read:', e);
      }
    }
  };

  const markNotificationsAsRead = async () => {
    if (!currentUser) return;
    const userNotifs = notifications.filter((n) => n.userId === currentUser.id && !n.read);
    for (const n of userNotifs) {
      try {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      } catch (e) {
        console.error('Error marking notification as read:', e);
      }
    }
  };

  const submitVerificationRequest = async (userId: string) => {
    if (!currentUser) return;
    const exists = verificationRequests.some((v) => v.userId === userId && v.status === 'pending');
    if (exists) return;

    const verifId = `verif_${Date.now()}`;
    const newReq: VerificationRequest = {
      id: verifId,
      userId,
      username: currentUser.username,
      fullName: currentUser.fullName,
      avatar: currentUser.avatar,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      await setDoc(doc(db, 'verification_requests', verifId), newReq);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `verification_requests/${verifId}`);
    }
  };

  const processVerificationRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    const req = verificationRequests.find((v) => v.id === requestId);
    if (!req) return;

    try {
      await updateDoc(doc(db, 'verification_requests', requestId), { status });
      await verifyUser(req.userId, status === 'approved');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `verification_requests/${requestId}`);
    }
  };

  const reportUser = async (
    reportedUserId: string,
    reportedUsername: string,
    reason: string,
    details: string
  ) => {
    if (!currentUser) return;

    const reportId = `report_${Date.now()}`;
    const newReport: UserReport = {
      id: reportId,
      reportedUserId,
      reportedUsername,
      reportedByUsername: currentUser.username,
      reason,
      details,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'reports', reportId), newReport);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reports/${reportId}`);
    }
  };

  const generateAIVerification = async (username: string): Promise<AIAnalysisResult | null> => {
    try {
      const userProjects = posts.filter(
        (p) => p.authorUsername.toLowerCase() === username.toLowerCase()
      );
      const userReports = reports.filter(
        (r) => r.reportedUsername.toLowerCase() === username.toLowerCase()
      );

      const response = await fetch('/api/ai-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: currentUser,
          projects: userProjects,
          reports: userReports,
        }),
      });

      if (!response.ok) throw new Error('AI service error');
      const data: AIAnalysisResult = await response.json();
      return data;
    } catch (err) {
      console.error('Error generating AI verification analysis:', err);
      return null;
    }
  };

  return (
    <SocialContext.Provider
      value={{
        posts,
        reels,
        messages,
        notifications,
        verificationRequests,
        reports,
        createPost,
        createReel,
        toggleLikePost,
        toggleSavePost,
        toggleLikeReel,
        addComment,
        getCommentsForPost,
        sendMessage,
        getConversationWithUser,
        reactToMessage,
        markMessagesAsRead,
        markNotificationsAsRead,
        submitVerificationRequest,
        processVerificationRequest,
        reportUser,
        generateAIVerification,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
