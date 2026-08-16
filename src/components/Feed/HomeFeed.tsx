import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from './PostCard';
import { VerificationBadge } from '../Common/VerificationBadge';
import { Sparkles, Code2, Github, Video, Flame, UserPlus } from 'lucide-react';

export const HomeFeed: React.FC<{
  onOpenProfile: (username: string) => void;
  onNavigateTab: (tab: string) => void;
  onRequireAuth?: () => void;
}> = ({ onOpenProfile, onNavigateTab, onRequireAuth }) => {
  const { posts } = useSocial();
  const { users, toggleFollow } = useAuth();

  const [feedFilter, setFeedFilter] = useState<'all' | 'projects' | 'github'>('all');

  const developers = users.filter((u) => u.role === 'developer' && u.isVerified);

  const filteredPosts = posts.filter((p) => {
    if (feedFilter === 'projects') return p.type === 'project';
    if (feedFilter === 'github') return p.type === 'github';
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Trending Verified Developers Stories Carousel (Only when developers exist) */}
      {developers.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Trending Verified Developers
            </span>
            <button
              onClick={() => onNavigateTab('search')}
              className="text-[11px] font-semibold text-orange-400 hover:underline"
            >
              Explore All
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {developers.map((dev) => (
              <div
                key={dev.id}
                onClick={() => onOpenProfile(dev.username)}
                className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
              >
                <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src={dev.avatar}
                    alt={dev.username}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-900"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    <VerificationBadge size="sm" />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-orange-400 truncate max-w-[70px]">
                  @{dev.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed Filters Tabs */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              feedFilter === 'all'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFeedFilter('projects')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              feedFilter === 'projects'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setFeedFilter('github')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              feedFilter === 'github'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
            }`}
          >
            GitHub Sync
          </button>
        </div>
      </div>

      {/* Feed Posts List */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Welcome to Starforge Feed</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No activity yet. Be the first to publish a project, share code, or connect with other creators!
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('search')}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/20 transition inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Discover Creators</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenProfile={onOpenProfile}
              onRequireAuth={onRequireAuth}
            />
          ))
        )}
      </div>
    </div>
  );
};
