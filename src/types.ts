export type UserRole = 'developer' | 'client' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  coverImage?: string;
  bio: string;
  skills: string[];
  location?: string;
  country?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  experience?: string;
  availability?: 'Available for Hire' | 'Busy' | 'Not Available';
  isVerified: boolean; // Orange badge granted by admin
  trustScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  followersCount: number;
  followingCount: number;
  postsCount?: number;
  reelsCount?: number;
  projectsCount?: number;
  savedByClients?: number;
  isBanned?: boolean;
  isSuspended?: boolean;
  createdAt: string;
}

export interface GitHubRepo {
  id: number | string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  topics?: string[];
  updatedAt: string;
  isPinned?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorFullName: string;
  authorAvatar: string;
  authorRole: UserRole;
  isVerified: boolean;
  type: 'post' | 'reel' | 'project' | 'github';
  title?: string;
  content: string;
  mediaUrls?: string[];
  videoUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
  likesCount: number;
  likedByCurrentUser?: boolean;
  savedByCurrentUser?: boolean;
  commentsCount: number;
  createdAt: string;
  githubStats?: {
    stars: number;
    forks: number;
    language: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  authorId: string;
  authorUsername: string;
  authorFullName: string;
  authorAvatar: string;
  isVerified: boolean;
  title: string;
  description: string;
  videoUrl: string;
  audioTitle: string;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser?: boolean;
  tags: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  projectAttachment?: {
    title: string;
    description: string;
    demoUrl?: string;
    githubUrl?: string;
    type: string;
  };
  read: boolean;
  createdAt: string;
  reaction?: string;
}

export interface Conversation {
  otherUser: UserProfile;
  lastMessage?: Message;
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'verification' | 'hire';
  fromUsername: string;
  fromAvatar: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  aiAnalysis?: AIAnalysisResult;
}

export interface AIAnalysisResult {
  trustScore: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: 'Verify' | 'Review Manually' | 'Reject';
  metrics: {
    profileCompleteness: number; // %
    githubActivityScore: number; // %
    projectQualityScore: number; // %
    spamBehaviorRisk: number; // %
  };
  explanation: string;
  positiveSignals: string[];
  riskSignals: string[];
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  reportedByUsername: string;
  reason: string;
  details: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}
