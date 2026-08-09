import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider, useSocial } from './context/SocialContext';
import { Navbar } from './components/Navigation/Navbar';
import { BottomNav } from './components/Navigation/BottomNav';
import { HomeFeed } from './components/Feed/HomeFeed';
import { SearchPage } from './components/Search/SearchPage';
import { ReelsViewer } from './components/Reels/ReelsViewer';
import { ProfilePage } from './components/Profile/ProfilePage';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AuthModal } from './components/Auth/AuthModal';
import { CreateModal } from './components/Create/CreateModal';
import { ChatDrawer } from './components/Chat/ChatDrawer';
import { ChatView } from './components/Chat/ChatView';
import { PostCard } from './components/Feed/PostCard';
import { Sparkles, Code2, Lock, ArrowRight, Eye, ShieldCheck, Github, Users, Video } from 'lucide-react';

function AppContent() {
  const { currentUser } = useAuth();
  const { posts, reels } = useSocial();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [profileUsername, setProfileUsername] = useState<string | undefined>(undefined);

  // Guest Shared Link State
  const [guestPreview, setGuestPreview] = useState<boolean>(false);
  const [sharedItemType, setSharedItemType] = useState<'post' | 'reel' | 'project' | null>(null);
  const [sharedItemId, setSharedItemId] = useState<string | null>(null);

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<any>(null);

  // Check URL parameters for shared content on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get('post') || params.get('project');
    const reelParam = params.get('reel');

    if (postParam) {
      setSharedItemType('post');
      setSharedItemId(postParam);
      setGuestPreview(true);
    } else if (reelParam) {
      setSharedItemType('reel');
      setSharedItemId(reelParam);
      setGuestPreview(true);
    }
  }, []);

  const handleOpenProfile = (username: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setProfileUsername(username);
    setActiveTab('profile');
  };

  const handleOpenChatWith = (user: any) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setChatTargetUser(user);
    setActiveTab('chat');
  };

  // Find shared post/reel if viewing shared link
  const sharedPost = sharedItemId ? posts.find((p) => p.id === sharedItemId) : null;
  const sharedReel = sharedItemId ? reels.find((r) => r.id === sharedItemId) : null;

  // 1. UNAUTHENTICATED LANDING GATE (When not logged in & not viewing shared content)
  if (!currentUser && !guestPreview) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-orange-500 selection:text-white">
        {/* Minimal Header */}
        <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">Starforge</span>
              <span className="hidden sm:inline-block text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full ml-2">
                Dev & Client Network
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </header>

        {/* Hero & Login Prompt Gateway */}
        <main className="max-w-4xl mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-orange-400 font-bold mb-6">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Exclusive Social Platform for Web Developers & Clients</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Connect, Showcase Projects & <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Hire Verified Developers
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Upload coding reels, sync GitHub repositories, collaborate with top developers, and hire verified tech talent. Sign in or register to enter the platform.
          </p>

          {/* Action Cards */}
          <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
            <div
              onClick={() => setIsAuthOpen(true)}
              className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 p-6 rounded-3xl text-left cursor-pointer transition group shadow-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Developer Portal</h3>
              <p className="text-xs text-zinc-400">Showcase code, post reels, connect GitHub & receive client offers.</p>
            </div>

            <div
              onClick={() => setIsAuthOpen(true)}
              className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 p-6 rounded-3xl text-left cursor-pointer transition group shadow-xl"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1">Client Portal</h3>
              <p className="text-xs text-zinc-400">Search top web developers, save favorites & hire verified experts.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-extrabold text-sm text-white shadow-xl shadow-orange-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Log In or Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setGuestPreview(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-800 transition flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-orange-400" />
              <span>Preview Public Content</span>
            </button>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-zinc-800/80 py-4 text-center text-xs text-zinc-500">
          Starforge Web Developer Social Platform • Secure Firebase Cloud Infrastructure
        </footer>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  // 2. GUEST PREVIEW MODE (Viewing shared posts, reels, or public showcases without login)
  if (!currentUser && guestPreview) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-orange-500 selection:text-white">
        {/* Sticky Guest Header Banner */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-orange-900/90 via-zinc-900/95 to-amber-900/90 border-b border-orange-500/30 backdrop-blur-md px-4 py-3 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Viewing in Guest Mode. Log in or create an account to like, comment, or message developers.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/30 transition"
            >
              Log In / Register
            </button>
            <button
              onClick={() => setGuestPreview(false)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Content View */}
        <main className="max-w-3xl mx-auto px-4 py-6">
          {sharedPost ? (
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-2xl text-xs text-orange-300 font-semibold flex items-center justify-between">
                <span>Shared Post / Project Preview</span>
                <button
                  onClick={() => {
                    setSharedItemId(null);
                    setSharedItemType(null);
                  }}
                  className="hover:underline"
                >
                  View All Public Feed
                </button>
              </div>
              <PostCard
                post={sharedPost}
                onOpenProfile={() => setIsAuthOpen(true)}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            </div>
          ) : sharedReel ? (
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-2xl text-xs text-orange-300 font-semibold flex items-center justify-between">
                <span>Shared Developer Reel Preview</span>
                <button
                  onClick={() => {
                    setSharedItemId(null);
                    setSharedItemType(null);
                  }}
                  className="hover:underline"
                >
                  View All Public Reels
                </button>
              </div>
              <ReelsViewer
                onOpenProfile={() => setIsAuthOpen(true)}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <span className="text-xs font-bold text-zinc-300">Public Developer Feed Preview</span>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs text-orange-400 font-bold hover:underline"
                >
                  Log in for Full Experience →
                </button>
              </div>
              <HomeFeed
                onOpenProfile={() => setIsAuthOpen(true)}
                onNavigateTab={() => setIsAuthOpen(true)}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            </div>
          )}
        </main>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  // 3. AUTHENTICATED USER INTERFACE
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onNavigateTab={(tab) => {
          if (tab === 'profile') {
            setProfileUsername(undefined);
          }
          setActiveTab(tab);
        }}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* TAB 1: HOME FEED */}
        {activeTab === 'home' && (
          <HomeFeed
            onOpenProfile={handleOpenProfile}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB 2: SEARCH */}
        {activeTab === 'search' && (
          <SearchPage
            onOpenProfile={handleOpenProfile}
            onOpenChatWith={handleOpenChatWith}
          />
        )}

        {/* TAB 3: REELS */}
        {activeTab === 'reels' && (
          <ReelsViewer onOpenProfile={handleOpenProfile} />
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <ProfilePage
            targetUsername={profileUsername}
            onOpenChatWith={handleOpenChatWith}
          />
        )}

        {/* TAB 5: DIRECT MESSAGES (INSTAGRAM STYLE) */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <ChatView
              initialTargetUser={chatTargetUser}
              onOpenProfile={handleOpenProfile}
            />
          </div>
        )}

        {/* TAB 6: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard onOpenProfile={handleOpenProfile} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          if (tab === 'profile') {
            setProfileUsername(undefined);
          }
          setActiveTab(tab);
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetUser={chatTargetUser}
        onOpenProfile={handleOpenProfile}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocialProvider>
        <AppContent />
      </SocialProvider>
    </AuthProvider>
  );
}
