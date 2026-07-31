import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { VerificationBadge } from '../Common/VerificationBadge';
import { Heart, MessageCircle, Share2, Music, UserPlus, Check, Volume2, VolumeX } from 'lucide-react';

export const ReelsViewer: React.FC<{
  onOpenProfile: (username: string) => void;
  onRequireAuth?: () => void;
}> = ({ onOpenProfile, onRequireAuth }) => {
  const { reels, toggleLikeReel } = useSocial();
  const { currentUser, toggleFollow } = useAuth();

  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  if (reels.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p>No Reels uploaded yet.</p>
      </div>
    );
  }

  const currentReel = reels[activeReelIndex];

  const handleLike = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    toggleLikeReel(currentReel.id);
  };

  const handleFollow = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    toggleFollow(currentReel.authorId);
  };

  const handleInteraction = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?reel=${currentReel.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto h-[80vh] min-h-[550px] relative rounded-3xl overflow-hidden bg-black shadow-2xl border border-zinc-800 flex items-center justify-center">
      {/* Background Video */}
      <video
        key={currentReel.id}
        src={currentReel.videoUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Mute/Unmute Overlay Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition z-10"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-orange-400" />}
      </button>

      {/* Navigation Buttons (Up / Down) */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button
          disabled={activeReelIndex === 0}
          onClick={() => setActiveReelIndex((prev) => Math.max(0, prev - 1))}
          className="px-2.5 py-1 rounded-full bg-black/60 text-xs font-bold text-white disabled:opacity-30 backdrop-blur-md"
        >
          ▲ Prev
        </button>
        <button
          disabled={activeReelIndex === reels.length - 1}
          onClick={() => setActiveReelIndex((prev) => Math.min(reels.length - 1, prev + 1))}
          className="px-2.5 py-1 rounded-full bg-black/60 text-xs font-bold text-white disabled:opacity-30 backdrop-blur-md"
        >
          ▼ Next
        </button>
      </div>

      {/* Reel Bottom Info Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 text-white z-10 space-y-3">
        {/* Author Details & Follow */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onOpenProfile(currentReel.authorUsername)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={currentReel.authorAvatar}
                alt={currentReel.authorUsername}
                className="w-10 h-10 rounded-full border-2 border-orange-500 object-cover"
              />
              {currentReel.isVerified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerificationBadge size="sm" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span>@{currentReel.authorUsername}</span>
                {currentReel.isVerified && <VerificationBadge size="sm" />}
              </div>
              <p className="text-[10px] text-zinc-300">{currentReel.authorFullName}</p>
            </div>
          </div>

          {(!currentUser || currentUser.id !== currentReel.authorId) && (
            <button
              onClick={handleFollow}
              className="px-3 py-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-md shadow-orange-500/30 ml-auto"
            >
              Follow
            </button>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-white">{currentReel.title}</h4>
          <p className="text-xs text-zinc-200 line-clamp-2">{currentReel.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {currentReel.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-orange-400 font-semibold">
              #{tag}
            </span>
          ))}
        </div>

        {/* Audio Title */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-300">
          <Music className="w-3.5 h-3.5 text-orange-400 animate-spin" />
          <span className="truncate">{currentReel.audioTitle}</span>
        </div>
      </div>

      {/* Floating Action Buttons Column (Right Side) */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-20">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition">
            <Heart
              className={`w-6 h-6 ${
                currentReel.likedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold text-white shadow-xs">
            {currentReel.likesCount}
          </span>
        </button>

        {/* Comments */}
        <button onClick={handleInteraction} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white shadow-xs">
            {currentReel.commentsCount}
          </span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1 group relative">
          <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white shadow-xs">Share</span>
          {copiedShare && (
            <span className="absolute -top-7 right-0 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap animate-in fade-in">
              Link Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
