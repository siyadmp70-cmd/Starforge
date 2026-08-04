import { UserProfile, Post, Reel, Message, VerificationRequest, UserReport, GitHubRepo, NotificationItem } from '../types';

export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_POSTS: Post[] = [];
export const INITIAL_REELS: Reel[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_VERIFICATION_REQUESTS: VerificationRequest[] = [];
export const INITIAL_REPORTS: UserReport[] = [];
export const INITIAL_GITHUB_REPOS: Record<string, GitHubRepo[]> = {};
