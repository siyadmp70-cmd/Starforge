import React, { useState } from 'react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { VerificationBadge } from '../Common/VerificationBadge';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Github,
  ExternalLink,
  Code2,
  Send,
  UserPlus,
  Check,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onOpenProfile: (username: string) => void;
  onRequireAuth?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenProfile, onRequireAuth }) => {
  const { currentUser, toggleFollow, users } = useAuth();
  const { toggleLikePost, toggleSavePost, addComment, getCommentsForPost } = useSocial();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const comments = getCommentsForPost(post.id);

  const authorProfile = users.find((u) => u.id === post.authorId);
  const isFollowing = currentUser?.following?.includes(post.authorId) || false;

  const handleLike = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    toggleLikePost(post.id);
  };

  const handleSave = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    toggleSavePost(post.id);
  };

  const handleFollow = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    toggleFollow(post.authorId);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?post=${post.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl mb-6">
      {/* Header: Author details & Follow */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800/60">
        <div
          onClick={() => onOpenProfile(post.authorUsername)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={post.authorAvatar}
              alt={post.authorUsername}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700 group-hover:scale-105 transition-transform"
            />
            {post.isVerified && (
              <div className="absolute -bottom-1 -right-1">
                <VerificationBadge size="sm" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-white group-hover:text-orange-400 transition">
              <span>{post.authorFullName}</span>
              {post.isVerified && <VerificationBadge size="sm" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>@{post.authorUsername}</span>
              <span>•</span>
              <span className="text-[10px] text-zinc-500">{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Follow Button */}
        {(!currentUser || currentUser.id !== post.authorId) && (
          <button
            onClick={handleFollow}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
              isFollowing
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs shadow-orange-500/20'
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Post Title & Text Content */}
      <div className="p-4 space-y-3">
        {post.title && (
          <h4 className="text-base font-bold text-white tracking-tight">{post.title}</h4>
        )}
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* Collaborators */}
        {post.collaborators && post.collaborators.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/50 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400">Collaborators:</span>
            {post.collaborators.map((collab) => (
              <button
                key={collab.id || collab.username}
                type="button"
                onClick={() => onOpenProfile(collab.username)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition"
              >
                <img
                  src={collab.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                  alt={collab.username}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>@{collab.username}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-orange-400 text-[11px] font-medium border border-zinc-700/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Gallery / Image Showcase */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative bg-zinc-950">
          <img
            src={post.mediaUrls[0]}
            alt="Post media"
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      {/* GitHub Repo Quick Stats Box if GitHub Post */}
      {post.githubStats && post.githubUrl && (
        <div className="mx-4 my-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <a
                href={post.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-white hover:text-orange-400 flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                <span>⭐ {post.githubStats.stars} stars</span>
                <span>🍴 {post.githubStats.forks} forks</span>
                <span className="text-orange-400">{post.githubStats.language}</span>
              </div>
            </div>
          </div>
          <a
            href={post.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700"
          >
            Code
          </a>
        </div>
      )}

      {/* Demo Link Bar */}
      {post.demoUrl && !post.githubStats && (
        <div className="px-4 py-2 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-orange-400" />
            Live Demo Available
          </span>
          <a
            href={post.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>Visit Demo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Action Buttons: Like, Comment, Share, Save */}
      <div className="p-4 flex items-center justify-between border-t border-zinc-800">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-red-400 transition"
          >
            <Heart
              className={`w-5 h-5 transition ${
                post.likedByCurrentUser ? 'fill-red-500 text-red-500 scale-110' : 'text-zinc-400'
              }`}
            />
            <span>{post.likesCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-orange-400 transition"
          >
            <MessageCircle className="w-5 h-5 text-zinc-400" />
            <span>{post.commentsCount + comments.length}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1 text-zinc-400 hover:text-white transition relative"
            title="Share Link"
          >
            <Share2 className="w-5 h-5" />
            {copiedShare && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap animate-in fade-in">
                Link Copied!
              </span>
            )}
          </button>
        </div>

        {/* Save/Bookmark */}
        <button
          onClick={handleSave}
          className="p-1 text-zinc-400 hover:text-orange-400 transition"
          title="Save Post"
        >
          <Bookmark
            className={`w-5 h-5 ${post.savedByCurrentUser ? 'fill-orange-500 text-orange-500' : ''}`}
          />
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-3">
          <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Comments</h5>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No comments yet. Be the first to reply!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <img
                    src={c.authorAvatar}
                    alt={c.authorUsername}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-bold text-white mr-2">@{c.authorUsername}</span>
                    <span className="text-zinc-300">{c.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          {currentUser && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
