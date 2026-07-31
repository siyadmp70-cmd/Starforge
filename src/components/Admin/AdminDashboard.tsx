import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { AIAssistantCard } from './AIAssistantCard';
import { VerificationBadge } from '../Common/VerificationBadge';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Bot,
  Flag,
  Search,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Code2,
  Briefcase,
  Activity,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onOpenProfile: (username: string) => void }> = ({
  onOpenProfile,
}) => {
  const { users, banUser, suspendUser, deleteUser, verifyUser } = useAuth();
  const { posts, reels, messages, reports, verificationRequests, processVerificationRequest } =
    useSocial();

  const [activeSection, setActiveSection] = useState<
    'analytics' | 'users' | 'verification' | 'ai' | 'reports'
  >('analytics');

  const [searchUserTerm, setSearchUserTerm] = useState('');

  const developers = users.filter((u) => u.role === 'developer');
  const clients = users.filter((u) => u.role === 'client');
  const verifiedDevs = developers.filter((d) => d.isVerified);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
              Admin Suite
            </span>
            <span className="text-xs text-zinc-400">System Control Center</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Starforge Admin Console</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage users, evaluate developer verification with AI, and oversee community moderation
          </p>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'analytics'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveSection('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'users'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('verification')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'verification'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>Verification Queue</span>
          </button>

          <button
            onClick={() => setActiveSection('ai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'ai'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => setActiveSection('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'reports'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Flag className="w-4 h-4 text-red-400" />
            <span>Reports ({reports.length})</span>
          </button>
        </div>
      </div>

      {/* 1. ANALYTICS STATS OVERVIEW */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Total Users</span>
              <div className="text-2xl font-extrabold text-white mt-1">{users.length}</div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-2">
                <span className="text-orange-400">{developers.length} Devs</span> •{' '}
                <span>{clients.length} Clients</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Verified Devs</span>
              <div className="text-2xl font-extrabold text-orange-400 mt-1 flex items-center gap-2">
                <span>{verifiedDevs.length}</span>
                <VerificationBadge size="md" />
              </div>
              <div className="text-[11px] text-zinc-400 mt-2">Orange Badge Granted</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Total Content</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {posts.length + reels.length}
              </div>
              <div className="text-[11px] text-zinc-400 mt-2">
                {posts.length} Posts • {reels.length} Reels
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Active Reports</span>
              <div className="text-2xl font-extrabold text-red-400 mt-1">{reports.length}</div>
              <div className="text-[11px] text-zinc-400 mt-2">Moderation Queue</div>
            </div>
          </div>

          <AIAssistantCard />
        </div>
      )}

      {/* 2. USER MANAGEMENT */}
      {activeSection === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">User Management Table</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search username, email..."
                value={searchUserTerm}
                onChange={(e) => setSearchUserTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/40">
                    <td className="p-3">
                      <div
                        onClick={() => onOpenProfile(u.username)}
                        className="flex items-center gap-2 cursor-pointer hover:text-orange-400"
                      >
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <div className="font-bold text-white">{u.fullName}</div>
                          <div className="text-[10px] text-zinc-500">@{u.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="capitalize font-semibold text-zinc-200">{u.role}</span>
                    </td>

                    <td className="p-3">
                      {u.isVerified ? (
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                          <VerificationBadge size="sm" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500">Unverified</span>
                      )}
                    </td>

                    <td className="p-3">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => verifyUser(u.id, !u.isVerified)}
                        className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold text-[10px] border border-orange-500/30"
                      >
                        {u.isVerified ? 'Revoke Badge' : 'Grant Badge'}
                      </button>

                      <button
                        onClick={() => banUser(u.id, !u.isBanned)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                          u.isBanned
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>

                      {u.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete user @${u.username}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. VERIFICATION QUEUE */}
      {activeSection === 'verification' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            Developer Verification Queue
          </h3>

          {verificationRequests.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">
              No pending verification requests.
            </p>
          ) : (
            <div className="space-y-4">
              {verificationRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.avatar}
                      alt={req.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-white text-sm">{req.fullName}</div>
                      <div className="text-zinc-400">@{req.username}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => processVerificationRequest(req.id, 'approved')}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
                    >
                      Approve & Grant Badge
                    </button>
                    <button
                      onClick={() => processVerificationRequest(req.id, 'rejected')}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. AI ASSISTANT DIRECT TAB */}
      {activeSection === 'ai' && <AIAssistantCard />}

      {/* 5. REPORTS & MODERATION */}
      {activeSection === 'reports' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            User Reports & Moderation
          </h3>

          {reports.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">No reported accounts.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400">Reported: @{rep.reportedUsername}</span>
                    <span className="text-[10px] text-zinc-500">
                      Reported by @{rep.reportedByUsername}
                    </span>
                  </div>
                  <p className="text-zinc-300">
                    <strong className="text-white">Reason:</strong> {rep.reason}
                  </p>
                  <p className="text-zinc-400">{rep.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
