import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { VerificationBadge } from '../Common/VerificationBadge';
import {
  Sparkles,
  Bell,
  MessageSquare,
  ShieldAlert,
  LogOut,
  User,
  Sliders,
  CheckCircle2,
  X,
  Code2,
  Briefcase,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenChat: () => void;
  onNavigateTab: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenChat,
  onNavigateTab,
  activeTab,
}) => {
  const { currentUser, logout, switchUserRole } = useAuth();
  const { notifications, markNotificationsAsRead } = useSocial();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const unreadCount = notifications.filter(
    (n) => currentUser && n.userId === currentUser.id && !n.read
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Starforge
            </span>
            <span className="block text-[10px] uppercase font-semibold text-orange-500 tracking-wider">
              Dev & Client Network
            </span>
          </div>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Demo Role Quick Switcher Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 border border-zinc-700 transition"
                  title="Switch Role for Demo"
                >
                  <Sliders className="w-3.5 h-3.5 text-orange-400" />
                  <span className="capitalize">{currentUser.role}</span>
                </button>

                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="text-[11px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                      Demo Role Switcher
                    </div>
                    <button
                      onClick={() => {
                        switchUserRole('developer');
                        setShowRoleSwitcher(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 text-xs text-left text-zinc-200"
                    >
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-orange-400" />
                        <div>
                          <div className="font-semibold">Developer Account</div>
                          <div className="text-[10px] text-zinc-500">Alex Rivera (Verified)</div>
                        </div>
                      </div>
                      {currentUser.role === 'developer' && (
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        switchUserRole('client');
                        setShowRoleSwitcher(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 text-xs text-left text-zinc-200"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-semibold">Client Account</div>
                          <div className="text-[10px] text-zinc-500">Tech Corp Client</div>
                        </div>
                      </div>
                      {currentUser.role === 'client' && (
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        switchUserRole('admin');
                        setShowRoleSwitcher(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 text-xs text-left text-zinc-200"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-semibold">Admin Account</div>
                          <div className="text-[10px] text-zinc-500">AI Verification Control</div>
                        </div>
                      </div>
                      {currentUser.role === 'admin' && (
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Button Link if admin */}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => onNavigateTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    activeTab === 'admin'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              {/* Messages Button */}
              <button
                onClick={() => {
                  onNavigateTab('chat');
                  onOpenChat();
                }}
                className={`relative p-2 rounded-full transition ${
                  activeTab === 'chat'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
                title="Direct Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {/* Notifications Popover Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifPopover(!showNotifPopover);
                    markNotificationsAsRead();
                  }}
                  className="relative p-2 rounded-full text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifPopover && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-orange-500" />
                        Notifications
                      </h4>
                      <button
                        onClick={() => setShowNotifPopover(false)}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                      {notifications.filter((n) => n.userId === currentUser.id).length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6">
                          No new notifications yet.
                        </p>
                      ) : (
                        notifications
                          .filter((n) => n.userId === currentUser.id)
                          .map((notif) => (
                            <div
                              key={notif.id}
                              className="flex items-start gap-3 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition text-xs"
                            >
                              <img
                                src={notif.fromAvatar}
                                alt={notif.fromUsername}
                                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                              />
                              <div className="flex-1">
                                <p className="text-zinc-200">
                                  <span className="font-semibold text-white">
                                    @{notif.fromUsername}
                                  </span>{' '}
                                  {notif.text}
                                </p>
                                <span className="text-[10px] text-zinc-500 mt-1 block">
                                  {notif.createdAt}
                                </span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Avatar Pill */}
              <button
                onClick={() => onNavigateTab('profile')}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  {currentUser.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <VerificationBadge size="sm" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-zinc-200 hidden md:inline">
                  @{currentUser.username}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 transition hover:scale-105"
            >
              <User className="w-4 h-4" />
              <span>Log In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
