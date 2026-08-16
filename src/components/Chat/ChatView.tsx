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
  Sparkles,
  ExternalLink,
  Github,
  Play,
  Pause,
  User,
  Heart,
  MessageCircle,
  Check,
  Briefcase,
  ChevronRight,
  Smile,
  Info,
  Upload,
  Plus,
  Edit3,
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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

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

  // Find all users with whom currentUser has exchanged at least one message
  const conversationUsers = allOtherUsers.filter((u) => {
    const msgs = getUserMessages(u.id);
    return msgs.length > 0;
  });

  // If activeUser is set (e.g. from search), ensure they are in the list if not already
  const displayedConversationUsers = [...conversationUsers];
  if (activeUser && !displayedConversationUsers.some((u) => u.id === activeUser.id)) {
    displayedConversationUsers.unshift(activeUser);
  }

  // Filter conversation list by search term
  const filteredConversations = displayedConversationUsers.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Search results for New Chat modal
  const newChatSearchResults = allOtherUsers.filter((u) => {
    if (!modalSearchTerm.trim()) return true;
    const term = modalSearchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      u.fullName.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const activeChatMessages = activeUser ? getUserMessages(activeUser.id) : [];

  // Scroll to bottom on new messages or user change and mark as read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeUser?.id) {
      markMessagesAsRead(activeUser.id);
    }
  }, [messages, activeUser?.id]);

  // Send standard text / image message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !customImageUrl) return;
    if (!activeUser) return;

    sendMessage(activeUser.id, inputText, customImageUrl || undefined);

    setInputText('');
    setCustomImageUrl('');
    setShowImagePicker(false);

    // Simulate response typing indicator from recipient
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2800);
  };

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          if (activeUser) {
            const mins = Math.floor(recordingSeconds / 60);
            const secs = recordingSeconds % 60;
            const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            sendMessage(
              activeUser.id,
              `🎤 Voice Note (${timeStr})`,
              undefined,
              undefined,
              base64Audio
            );
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone permission is required to record voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleSendVoiceNote = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result && activeUser) {
        const dataUrl = evt.target.result as string;
        if (file.type.startsWith('video/')) {
          sendMessage(activeUser.id, `📹 Video Attachment`, undefined, undefined, undefined, dataUrl);
        } else {
          sendMessage(activeUser.id, `📷 Image Attachment`, dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Attach GitHub project repository
  const handleAttachRepo = (repo: any) => {
    if (!activeUser) return;
    sendMessage(
      activeUser.id,
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

      {/* NEW CHAT / USER SEARCH MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm">New Direct Message</h3>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search input in modal */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by username, full name, or role..."
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {newChatSearchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No users found matching "{modalSearchTerm}".
                </div>
              ) : (
                newChatSearchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setActiveUser(u);
                      setShowNewChatModal(false);
                      setModalSearchTerm('');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-800/80 transition text-left border border-transparent hover:border-zinc-700/60 group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-xs text-white group-hover:text-orange-400 transition">
                          <span>{u.fullName}</span>
                          {u.isVerified && <VerificationBadge size="sm" />}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          @{u.username} • <span className="capitalize">{u.role}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-orange-400 font-semibold px-2.5 py-1 rounded-lg bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-white transition">
                      Chat
                    </span>
                  </button>
                ))
              )}
            </div>
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
              {conversationUsers.length > 0
                ? `${conversationUsers.length} active conversation${conversationUsers.length === 1 ? '' : 's'}`
                : 'No active conversations'}
            </p>
          </div>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition flex items-center gap-1 text-xs font-bold"
            title="Start New Message"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search conversations..."
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
        </div>

        {/* User Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {displayedConversationUsers.length === 0 ? (
            <div className="text-center py-16 px-4 text-zinc-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-xs text-zinc-300">No messages yet</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Search for developers or clients to start a conversation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Messaging</span>
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-zinc-500 text-xs">
              <p className="font-semibold mb-1">No matching conversations.</p>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                className="text-orange-400 hover:underline font-bold mt-2 text-[11px]"
              >
                Search all users on platform →
              </button>
            </div>
          ) : (
            filteredConversations.map((u) => {
              const uMsgs = getUserMessages(u.id);
              const lastMsg = uMsgs[uMsgs.length - 1];
              const isSelected = activeUser?.id === u.id;
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
                      <span className="text-[11px] text-zinc-400">@{u.username}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 capitalize font-medium">
                        {u.role}
                      </span>
                    </div>

                    {/* Last message preview */}
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-zinc-400 truncate">
                        {lastMsg ? (
                          lastMsg.senderId === currentUser.id ? (
                            <span>You: {lastMsg.text}</span>
                          ) : (
                            <span className={unreadCount > 0 ? 'font-bold text-white' : ''}>
                              {lastMsg.text}
                            </span>
                          )
                        ) : (
                          <span className="italic text-zinc-500">Draft / New chat</span>
                        )}
                      </p>

                      {unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-1">
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

      {/* RIGHT PANEL: ACTIVE CHAT THREAD OR EMPTY STATE */}
      <div className="flex-1 flex flex-col bg-zinc-900/90 h-full relative">
        {activeUser ? (
          <>
            {/* Chat Thread Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.username}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                    <span>{activeUser.fullName}</span>
                    {activeUser.isVerified && <VerificationBadge size="sm" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>@{activeUser.username}</span>
                    <span>•</span>
                    <span className="capitalize text-orange-400">{activeUser.role}</span>
                  </div>
                </div>
              </div>

              {onOpenProfile && (
                <button
                  onClick={() => onOpenProfile(activeUser.username)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition"
                >
                  View Profile
                </button>
              )}
            </div>

            {/* Messages Thread Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChatMessages.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.username}
                    className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-zinc-700 shadow-xl"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeUser.fullName}</h4>
                    <p className="text-xs text-zinc-400">@{activeUser.username}</p>
                  </div>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    This is the start of your direct messages with {activeUser.fullName}. Say hello or share your projects!
                  </p>
                </div>
              ) : (
                activeChatMessages.map((m) => {
                  const isMine = m.senderId === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div
                        className={`max-w-[78%] sm:max-w-md rounded-2xl p-3.5 text-xs shadow-md ${
                          isMine
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-none'
                            : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/60'
                        }`}
                      >
                        {/* Attached Image if any */}
                        {m.imageUrl && (
                          <img
                            src={m.imageUrl}
                            alt="Attachment"
                            onClick={() => setPreviewImage(m.imageUrl || null)}
                            className="rounded-xl mb-2 max-h-56 w-full object-cover cursor-pointer hover:opacity-90 transition border border-black/20"
                          />
                        )}

                        {/* Attached Audio Voice Note if any */}
                        {m.audioUrl && (
                          <div className="mb-2 p-2 bg-black/30 rounded-xl flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (playingAudioId === m.id) {
                                  setPlayingAudioId(null);
                                } else {
                                  setPlayingAudioId(m.id);
                                  const audio = new Audio(m.audioUrl);
                                  audio.play();
                                  audio.onended = () => setPlayingAudioId(null);
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center shrink-0 shadow"
                            >
                              {playingAudioId === m.id ? (
                                <Pause className="w-4 h-4 fill-zinc-900" />
                              ) : (
                                <Play className="w-4 h-4 fill-zinc-900 ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1">
                              <span className="text-[11px] font-bold">Voice Note</span>
                              <div className="h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full bg-white transition-all duration-300 ${
                                    playingAudioId === m.id ? 'w-full animate-pulse' : 'w-0'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Attached Project Repo if any */}
                        {m.projectAttachment && (
                          <div className="mb-2 p-3 bg-black/40 rounded-xl border border-white/10 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                              <Github className="w-4 h-4 text-orange-400" />
                              <span>{m.projectAttachment.title}</span>
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-tight">
                              {m.projectAttachment.description}
                            </p>
                            {m.projectAttachment.githubUrl && (
                              <a
                                href={m.projectAttachment.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-orange-300 font-bold hover:underline pt-1"
                              >
                                <span>Open on GitHub</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Text Content */}
                        <p className="leading-relaxed whitespace-pre-line font-medium">{m.text}</p>
                      </div>

                      {/* Timestamp & Read Receipts */}
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 px-1">
                        <span>{m.createdAt}</span>
                        {isMine && (
                          <Check className="w-3 h-3 text-orange-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Message Footer */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-zinc-800 bg-zinc-950/90 flex flex-col gap-2"
            >
              {/* Custom Image URL or Preset Preview if selected */}
              {customImageUrl && (
                <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded-xl">
                  <img
                    src={customImageUrl}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <span className="text-xs text-zinc-300 truncate flex-1">Image attached</span>
                  <button
                    type="button"
                    onClick={() => setCustomImageUrl('')}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 transition"
                  title="Upload Image/Video"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className={`p-2 rounded-xl transition ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-zinc-400 hover:text-orange-400 hover:bg-zinc-800'
                  }`}
                  title={isRecording ? 'Stop & Send Recording' : 'Record Voice Note'}
                >
                  <Mic className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder={
                    isRecording
                      ? `Recording Voice Note (${recordingSeconds}s)...`
                      : `Message @${activeUser.username}...`
                  }
                  value={inputText}
                  disabled={isRecording}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 py-2.5 px-4 bg-zinc-800/80 border border-zinc-700/80 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !customImageUrl}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 disabled:opacity-40 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* INSTAGRAM STYLE EMPTY STATE WHEN NO CHAT IS SELECTED */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-amber-600/20 border border-orange-500/30 flex items-center justify-center shadow-2xl">
              <MessageCircle className="w-10 h-10 text-orange-400" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="text-xl font-extrabold text-white">Your Messages</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Send private messages, coding attachments, and voice notes to web developers or clients.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/25 transition hover:scale-105 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
