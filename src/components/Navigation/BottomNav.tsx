import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, PlusSquare, MessageSquare, User, ShieldAlert } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenCreate: () => void;
  onOpenChat: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenCreate,
  onOpenChat,
}) => {
  const { currentUser } = useAuth();

  const isDeveloper = currentUser?.role === 'developer';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 text-zinc-400 py-2 px-4 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onNavigateTab('home')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'home' ? 'text-orange-500 scale-110' : 'hover:text-zinc-200'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => onNavigateTab('search')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'search' ? 'text-orange-500 scale-110' : 'hover:text-zinc-200'
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        {/* Create Button (Exclusively for Developers) */}
        {isDeveloper && (
          <button
            onClick={onOpenCreate}
            className="flex flex-col items-center gap-1 transition group"
            title="Create Post, Reel or Project"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <PlusSquare className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-semibold text-orange-400">Create</span>
          </button>
        )}

        {/* Admin Dashboard Tab (If Admin) */}
        {isAdmin && (
          <button
            onClick={() => onNavigateTab('admin')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'admin' ? 'text-amber-400 scale-110' : 'hover:text-amber-400'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        )}

        {/* Messages */}
        <button
          onClick={() => {
            onNavigateTab('chat');
          }}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'chat' ? 'text-orange-500 scale-110' : 'hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Messages</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavigateTab('profile')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'profile' ? 'text-orange-500 scale-110' : 'hover:text-zinc-200'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
