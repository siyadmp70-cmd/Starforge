import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { VerificationBadge } from '../Common/VerificationBadge';
import { INITIAL_GITHUB_REPOS } from '../../data/initialData';
import {
  Search,
  Send,
  Image as ImageIcon,
  Code2,
  Mic,
  X,
  CheckCheck,
  Sparkles,
  ExternalLink,
  Github,
  Play,
  Pause,
  User,
  Heart,
  MessageCircle,
  Filter,
  Check,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Smile,
  Info,
} from 'lucide-react';

interface ChatViewProps {
  initialTargetUser?: any;
  onOpenProfile?: (username: string) => void;
  onCloseModal?: () => void;
  isModalMode?: boolean;
}

// Sample preset images for quick chat attachment
const SAMPLE_CHAT_IMAGES = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
];

export const ChatView: React.FC<ChatViewProps> = ({
  initialTargetUser,
  onOpenProfile,
  onCloseModal,
  isModalMode = false,
}) => {
  const { currentUser, users } = useAuth();
  const { messages, sendMessage, reactToMessage, markMessagesAsRead } = useSocial();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'messaged' | 'unread'>('all');

  // Selected Active Chat User
  const [activeUser, setActiveUser] = useState<any>(initialTargetUser || null);

  // Message Form State
  const [inputText, setInputText] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showRepoPicker, setShowRepoPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Voice Note Playback Simulation State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Lightbox Image Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ensure initialTargetUser updates active user when prop changes
  useEffect(() => {
    if (initialTargetUser) {
      setActiveUser(initialTargetUser);
    }
  }, [initialTargetUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 text-zinc-500">
        Please log in to access Direct Messages.
      </div>
    );
  }

  // All eligible users on platform excluding self and banned users
  const allOtherUsers = users.filter((u) => u.id !== currentUser.id && !u.isBanned);

  // Helper function to get messages between currentUser and another user
  const getUserMessages = (otherUserId: string) => {
    return messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === currentUser.id)
    );
  };

  // Check if currentUser messaged a specific user before
  const getHasMessagedBefore = (otherUserId: string) => {
    const chatMsgs = getUserMessages(otherUserId);
    return chatMsgs.length > 0;
  };

  // Auto select first user if none active
  useEffect(() => {
    if (!activeUser && allOtherUsers.length > 0) {
      setActiveUser(allOtherUsers[0]);
    }
  }, [allOtherUsers, activeUser]);

  // Filtered list of users according to search term & filter tab
  const filteredUsers = allOtherUsers.filter((u) => {
    const userMsgs = getUserMessages(u.id);
    const hasMessaged = userMsgs.length > 0;
    const unreadCount = userMsgs.filter((m) => m.receiverId === currentUser.id && !m.read).length;

    // Search filter
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'messaged') {
      return hasMessaged;
    }
    if (activeFilter === 'unread') {
      return unreadCount > 0;
    }

    return true;
  });

  // Calculate statistics for filter headers
  const messagedUsersCount = allOtherUsers.filter((u) => getHasMessagedBefore(u.id)).length;
  const unreadUsersCount = allOtherUsers.filter(
    (u) => getUserMessages(u.id).filter((m) => m.receiverId === currentUser.id && !m.read).length > 0
  ).length;

  const currentChatUser = activeUser || filteredUsers[0] || allOtherUsers[0];
  const activeChatMessages = currentChatUser ? getUserMessages(currentChatUser.id) : [];
  const activeUserHasMessaged = currentChatUser ? getHasMessagedBefore(currentChatUser.id) : false;

  // Scroll to bottom on new messages or user change and mark as read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (currentChatUser?.id) {
      markMessagesAsRead(currentChatUser.id);
    }
  }, [messages, activeUser, currentChatUser?.id]);

  // Repositories for project attachments
  const currentUserRepos =
    INITIAL_GITHUB_REPOS[currentUser.username] ||
    INITIAL_GITHUB_REPOS['alex_dev'] ||
    [];

  // Send standard text / image message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !customImageUrl) return;
    if (!currentChatUser) return;

    sendMessage(currentChatUser.id, inputText, customImageUrl || undefined);

    setInputText('');
    setCustomImageUrl('');
    setShowImagePicker(false);

    // Simulate response typing indicator from recipient
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2800);
  };

  // Send simulated voice note message
  const handleSendVoiceNote = () => {
    if (!currentChatUser) return;
    sendMessage(
      currentChatUser.id,
      "🎤 Voice Note (0:14) • Click to play audio stream",
      undefined,
      undefined
    );
  };

  // Attach GitHub project repository
  const handleAttachRepo = (repo: any) => {
    if (!currentChatUser) return;
    sendMessage(
      currentChatUser.id,
      `Check out my featured Starforge repository "${repo.name}":`,
      undefined,
      {
        title: repo.name,
        description: repo.description,
        githubUrl: repo.url,
        type: 'GitHub Repository',
      }
    );
    setShowRepoPicker(false);
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white h-[82vh] max-h-[850px] relative">
      {/* Lightbox Modal for Image Attachments */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={previewImage} alt="Enlarged preview" className="rounded-2xl max-h-[85vh] object-contain shadow-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR: CONVERSATION LIST & SEARCH */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col bg-zinc-950/80">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-base tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Direct Messages</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {messagedUsersCount > 0
                ? `${messagedUsersCount} Messaged • Search anyone`
                : 'Search any developer or client'}
            </p>
          </div>

          {isModalMode && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Bar Input (Search anyone on platform like Instagram) */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search user, name, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs (All / Messaged Before / Unread) */}
          <div className="flex items-center gap-1 mt-2.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                activeFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              All ({allOtherUsers.length})
            </button>
            <button
              onClick={() => setActiveFilter('messaged')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                activeFilter === 'messaged'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              <span>Messaged Before</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full">
                {messagedUsersCount}
              </span>
            </button>
            {unreadUsersCount > 0 && (
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  activeFilter === 'unread'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-zinc-800/80 text-amber-400 hover:text-white'
                }`}
              >
                <span>Unread</span>
                <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {unreadUsersCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* User Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 px-4 text-zinc-500 text-xs">
              <p className="font-semibold mb-1">No matching users found.</p>
              <p className="text-[11px] text-zinc-600">
                Try searching for names like "Alex", "Maya", or "TechCorp".
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const uMsgs = getUserMessages(u.id);
              const hasMessaged = uMsgs.length > 0;
              const lastMsg = uMsgs[uMsgs.length - 1];
              const isSelected = currentChatUser?.id === u.id;
              const unreadCount = uMsgs.filter((m) => m.receiverId === currentUser.id && !m.read).length;

              return (
                <div
                  key={u.id}
                  onClick={() => setActiveUser(u)}
                  className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition relative group ${
                    isSelected
                      ? 'bg-orange-500/15 border border-orange-500/40 shadow-lg'
                      : 'hover:bg-zinc-800/60 border border-transparent'
                  }`}
                >
                  {/* User Avatar with Online Dot */}
                  <div className="relative shrink-0">
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-11 h-11 rounded-full object-cover border border-zinc-700 shadow-md"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  </div>

                  {/* Info Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1 font-extrabold text-xs text-white truncate">
                        <span className="truncate">{u.fullName}</span>
                        {u.isVerified && <VerificationBadge size="sm" />}
                      </div>

                      {lastMsg && (
                        <span className="text-[10px] text-zinc-500 shrink-0">
                          {lastMsg.createdAt}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-zinc-400 truncate">@{u.username}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 capitalize border border-zinc-700/60">
                        {u.role}
                      </span>
                    </div>

                    {/* Has Messaged Before Badge vs New Chat Badge */}
                    <div className="flex items-center justify-between gap-1">
                      {hasMessaged ? (
                        <p className="text-[11px] text-orange-400/90 font-medium truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          <span className="truncate">
                            {lastMsg
                              ? lastMsg.senderId === currentUser.id
                                ? `You: ${lastMsg.text}`
                                : lastMsg.text
                              : `${uMsgs.length} messages exchanged`}
                          </span>
                        </p>
                      ) : (
                        <span className="text-[10px] text-amber-400/80 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          ✨ New Chat • Not Messaged Yet
                        </span>
                      )}

                      {unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN CHAT DISPLAY */}
      <div className="flex-1 flex flex-col bg-zinc-900">
        {currentChatUser ? (
          <>
            {/* Top Bar Active Chat Info */}
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={currentChatUser.avatar}
                    alt={currentChatUser.username}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                    <span>{currentChatUser.fullName}</span>
                    {currentChatUser.isVerified && <VerificationBadge size="sm" />}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold capitalize ml-1 border border-zinc-700/60">
                      {currentChatUser.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active now
                    </span>
                    <span>• @{currentChatUser.username}</span>
                  </div>
                </div>
              </div>

              {/* Top Bar Action Buttons */}
              <div className="flex items-center gap-2">
                {onOpenProfile && (
                  <button
                    onClick={() => onOpenProfile(currentChatUser.username)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5 text-orange-400" />
                    <span className="hidden sm:inline">Profile</span>
                  </button>
                )}

                {isModalMode && onCloseModal && (
                  <button
                    onClick={onCloseModal}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* MESSAGES THREAD BODY */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Profile Intro Hero Banner at top of chat thread */}
              <div className="text-center py-6 border-b border-zinc-800/80 mb-4 bg-zinc-950/30 rounded-3xl p-6">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <img
                    src={currentChatUser.avatar}
                    alt={currentChatUser.username}
                    className="w-full h-full rounded-full object-cover border-2 border-orange-500 shadow-xl"
                  />
                  {currentChatUser.isVerified && (
                    <div className="absolute -bottom-1 -right-1">
                      <VerificationBadge size="md" showLabel={false} />
                    </div>
                  )}
                </div>

                <h4 className="font-extrabold text-base text-white">{currentChatUser.fullName}</h4>
                <p className="text-xs text-orange-400 font-semibold">@{currentChatUser.username}</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  {currentChatUser.bio || 'Starforge Network Member'}
                </p>

                {/* Status Indicator */}
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                  {activeUserHasMessaged ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">
                        Messaged Before ({activeChatMessages.length} Messages)
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 font-bold">
                        No Previous Messages • Say Hello!
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Chat Bubbles */}
              {activeChatMessages.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  <p className="font-semibold text-zinc-400 mb-1">
                    Start a conversation with @{currentChatUser.username}
                  </p>
                  <p>Send a message, attach code, or share a voice note!</p>
                </div>
              ) : (
                activeChatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isVoiceNote = msg.text.includes('Voice Note');

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs shadow-xl space-y-2 relative transition ${
                          isMe
                            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-br-xs'
                            : 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 rounded-bl-xs'
                        }`}
                      >
                        {/* Message Text */}
                        {!isVoiceNote && (
                          <p className="leading-relaxed whitespace-pre-line text-xs font-normal">
                            {msg.text}
                          </p>
                        )}

                        {/* Interactive Simulated Voice Note */}
                        {isVoiceNote && (
                          <div className="flex items-center gap-3 p-2 bg-black/30 rounded-2xl border border-white/10">
                            <button
                              onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                              className="w-9 h-9 rounded-full bg-white text-orange-600 flex items-center justify-center shadow-md hover:scale-105 transition"
                            >
                              {playingAudioId === msg.id ? (
                                <Pause className="w-4 h-4 fill-orange-600" />
                              ) : (
                                <Play className="w-4 h-4 fill-orange-600 ml-0.5" />
                              )}
                            </button>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span>Voice Note</span>
                                <span>0:14</span>
                              </div>
                              {/* Audio Wave Bar Graphics */}
                              <div className="flex items-center gap-1 h-3">
                                {[40, 70, 30, 90, 100, 60, 40, 80, 50, 90, 70, 30, 80].map((h, idx) => (
                                  <div
                                    key={idx}
                                    style={{ height: `${h}%` }}
                                    className={`w-1 rounded-full transition-all ${
                                      playingAudioId === msg.id
                                        ? 'bg-white animate-pulse'
                                        : isMe
                                        ? 'bg-white/60'
                                        : 'bg-orange-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Image Attachment */}
                        {msg.imageUrl && (
                          <div
                            onClick={() => setPreviewImage(msg.imageUrl!)}
                            className="relative rounded-2xl overflow-hidden cursor-pointer group/img border border-white/20"
                          >
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              className="max-h-52 w-full object-cover group-hover/img:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white font-bold text-[11px]">
                              Tap to Expand 🔍
                            </div>
                          </div>
                        )}

                        {/* Project / Repository Attachment Card */}
                        {msg.projectAttachment && (
                          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/20 space-y-1.5 text-left">
                            <div className="font-bold flex items-center gap-1.5 text-white">
                              <Github className="w-4 h-4 text-orange-300" />
                              <span>{msg.projectAttachment.title}</span>
                            </div>
                            <p className="text-[11px] text-zinc-200">
                              {msg.projectAttachment.description}
                            </p>
                            {msg.projectAttachment.githubUrl && (
                              <a
                                href={msg.projectAttachment.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-200 hover:underline pt-1"
                              >
                                <span>View GitHub Repository</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Time & Delivery Status */}
                        <div className="flex items-center justify-between text-[9px] opacity-80 pt-1 border-t border-white/10">
                          <span>{msg.createdAt}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>

                      {/* Instagram Double-Tap / Hover Emoji Reactions Bar */}
                      <div className="flex items-center gap-1 mt-1 opacity-90 transition">
                        {['❤️', '🔥', '👍', '🚀', '😂'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => reactToMessage(msg.id, emoji)}
                            className="hover:scale-125 transition text-xs p-0.5"
                            title={`React ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                        {msg.reaction && (
                          <span className="ml-1 bg-zinc-800 text-white rounded-full px-2 py-0.5 text-[10px] border border-zinc-700 shadow-sm font-bold">
                            {msg.reaction}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 italic bg-zinc-800/60 p-2.5 rounded-2xl w-max animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  <span>@{currentChatUser.username} is typing a response...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Custom Image URL Selector Drawer if toggled */}
            {showImagePicker && (
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 space-y-2 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>Attach Image or UI Screenshot:</span>
                  <button
                    onClick={() => setShowImagePicker(false)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_CHAT_IMAGES.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCustomImageUrl(imgUrl)}
                      className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        customImageUrl === imgUrl ? 'border-orange-500 scale-105' : 'border-zinc-800 opacity-70'
                      }`}
                    >
                      <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or paste custom image URL (https://...)"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* Repository Picker Drawer if toggled */}
            {showRepoPicker && (
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 space-y-2 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>Share GitHub Repository:</span>
                  <button
                    onClick={() => setShowRepoPicker(false)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {currentUserRepos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => handleAttachRepo(repo)}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 text-xs cursor-pointer flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-orange-400" />
                          <span>{repo.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate max-w-xs">{repo.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INPUT FORM BAR */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
            >
              {/* Image Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowImagePicker(!showImagePicker);
                  setShowRepoPicker(false);
                }}
                className={`p-2 rounded-xl transition ${
                  showImagePicker ? 'text-orange-400 bg-orange-500/10' : 'text-zinc-400 hover:text-orange-400'
                }`}
                title="Attach Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Repo Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowRepoPicker(!showRepoPicker);
                  setShowImagePicker(false);
                }}
                className={`p-2 rounded-xl transition ${
                  showRepoPicker ? 'text-orange-400 bg-orange-500/10' : 'text-zinc-400 hover:text-orange-400'
                }`}
                title="Share GitHub Project"
              >
                <Code2 className="w-5 h-5" />
              </button>

              {/* Instant Voice Note Send */}
              <button
                type="button"
                onClick={handleSendVoiceNote}
                className="p-2 text-zinc-400 hover:text-orange-400 transition"
                title="Send Voice Note"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Input Text Box */}
              <input
                type="text"
                placeholder={`Message @${currentChatUser.username}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
              />

              {/* Send Button */}
              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-xs p-6 text-center">
            <MessageCircle className="w-12 h-12 text-zinc-700 mb-3" />
            <h4 className="font-bold text-zinc-300 text-sm mb-1">Your Direct Messages</h4>
            <p className="max-w-xs">
              Search for any developer or client in the left panel to view message history or start a new conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
