import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { INITIAL_GITHUB_REPOS } from '../../data/initialData';
import { VerificationBadge } from '../Common/VerificationBadge';
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Github,
  Linkedin,
  Calendar,
  Grid,
  Code2,
  Video,
  Star,
  GitFork,
  Check,
  UserPlus,
  MessageSquare,
  Edit3,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface ProfilePageProps {
  targetUsername?: string;
  onOpenChatWith: (user: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  targetUsername,
  onOpenChatWith,
}) => {
  const { currentUser, getUserByUsername, toggleFollow, updateProfile, submitVerificationRequest } =
    useAuth();
  const { posts, reels } = useSocial();

  const profileUser = targetUsername
    ? getUserByUsername(targetUsername) || currentUser
    : currentUser;

  const [activeTab, setActiveTab] = useState<'posts' | 'projects' | 'reels' | 'github' | 'portfolio'>(
    'posts'
  );

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBio, setEditBio] = useState(profileUser?.bio || '');
  const [editSkills, setEditSkills] = useState(profileUser?.skills.join(', ') || '');
  const [editWebsite, setEditWebsite] = useState(profileUser?.website || '');
  const [editLocation, setEditLocation] = useState(profileUser?.location || '');
  const [editGithub, setEditGithub] = useState(profileUser?.github || '');

  if (!profileUser) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p>Profile not found.</p>
      </div>
    );
  }

  const isSelf = currentUser && currentUser.id === profileUser.id;
  const isFollowing = currentUser ? currentUser.followingCount > 0 : false;

  const userPosts = posts.filter(
    (p) => p.authorUsername.toLowerCase() === profileUser.username.toLowerCase()
  );
  const userProjects = userPosts.filter((p) => p.type === 'project' || p.type === 'github');
  const userReels = reels.filter(
    (r) => r.authorUsername.toLowerCase() === profileUser.username.toLowerCase()
  );

  const userRepos =
    INITIAL_GITHUB_REPOS[profileUser.username] ||
    INITIAL_GITHUB_REPOS['alex_dev'] ||
    [];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      bio: editBio,
      skills: editSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      website: editWebsite,
      location: editLocation,
      github: editGithub,
    });
    setShowEditModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Cover Image & Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Photo */}
        <div className="h-44 sm:h-52 w-full bg-zinc-800 relative">
          {profileUser.coverImage ? (
            <img
              src={profileUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 opacity-60" />
          )}
        </div>

        {/* Profile Avatar & Actions Row */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.username}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-zinc-900 shadow-xl"
              />
              {profileUser.isVerified && (
                <div className="absolute -bottom-2 -right-2">
                  <VerificationBadge size="lg" showLabel={false} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              {!isSelf && (
                <>
                  <button
                    onClick={() => toggleFollow(profileUser.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isFollowing
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenChatWith(profileUser)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                    <span>Message</span>
                  </button>

                  {profileUser.role === 'developer' && (
                    <button
                      onClick={() =>
                        alert(
                          `Hire Inquiry sent to @${profileUser.username}! They will receive your request.`
                        )
                      }
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition hover:scale-105 flex items-center gap-1.5"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Hire Me</span>
                    </button>
                  )}
                </>
              )}

              {isSelf && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Edit3 className="w-4 h-4 text-orange-400" />
                    <span>Edit Profile</span>
                  </button>

                  {!profileUser.isVerified && (
                    <button
                      onClick={() => {
                        submitVerificationRequest(profileUser.id);
                        alert(
                          'Verification request submitted to Admin! AI Verification Assistant is auditing your profile.'
                        );
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Request Orange Badge</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Names & Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {profileUser.fullName}
              </h2>
              {profileUser.isVerified && <VerificationBadge size="md" showLabel />}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="text-orange-400 font-semibold">@{profileUser.username}</span>
              {profileUser.availability && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  {profileUser.availability}
                </span>
              )}
              {profileUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {profileUser.location}
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl pt-1">
              {profileUser.bio}
            </p>

            {/* Experience / Tagline */}
            {profileUser.experience && (
              <p className="text-xs text-amber-400 font-medium">{profileUser.experience}</p>
            )}

            {/* Links & Contact */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-orange-400 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-orange-400" />
                  <span>{profileUser.website.replace('https://', '')}</span>
                </a>
              )}
              {profileUser.github && (
                <a
                  href={`https://github.com/${profileUser.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-orange-400 transition"
                >
                  <Github className="w-3.5 h-3.5 text-orange-400" />
                  <span>github/{profileUser.github}</span>
                </a>
              )}
              {profileUser.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  {profileUser.email}
                </span>
              )}
            </div>

            {/* Skills chips */}
            <div className="flex flex-wrap gap-1.5 pt-3">
              {profileUser.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Stats Counters */}
          <div className="grid grid-cols-4 gap-2 border-t border-zinc-800 mt-6 pt-4 text-center">
            <div>
              <div className="text-base font-extrabold text-white">
                {profileUser.followersCount}
              </div>
              <div className="text-[10px] uppercase font-bold text-zinc-500">Followers</div>
            </div>
            <div>
              <div className="text-base font-extrabold text-white">
                {profileUser.followingCount}
              </div>
              <div className="text-[10px] uppercase font-bold text-zinc-500">Following</div>
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{userPosts.length}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500">Posts</div>
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{userProjects.length}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500">Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Navigation Tabs */}
      <div className="flex rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800 shadow-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'posts'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Projects ({userProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'reels'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Reels ({userReels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'github'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Repos ({userRepos.length})</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 gap-4">
          {userPosts.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              <p>No posts published yet.</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3"
              >
                {post.title && <h4 className="font-bold text-white text-base">{post.title}</h4>}
                <p className="text-xs text-zinc-300 leading-relaxed">{post.content}</p>
                {post.mediaUrls && post.mediaUrls[0] && (
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post"
                    className="rounded-2xl max-h-72 w-full object-cover border border-zinc-800"
                  />
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                  <span>❤️ {post.likesCount} Likes</span>
                  <span>💬 {post.commentsCount} Comments</span>
                  <span className="ml-auto text-[10px] text-zinc-500">{post.createdAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userProjects.length === 0 ? (
            <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              <p>No showcase projects added yet.</p>
            </div>
          ) : (
            userProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  {proj.mediaUrls && proj.mediaUrls[0] && (
                    <img
                      src={proj.mediaUrls[0]}
                      alt="Project Screenshot"
                      className="w-full h-36 object-cover rounded-2xl mb-3 border border-zinc-800"
                    />
                  )}
                  <h4 className="font-bold text-white text-sm">{proj.title || 'Featured Project'}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{proj.content}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-300 font-semibold hover:text-white flex items-center gap-1"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. REELS TAB */}
      {activeTab === 'reels' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {userReels.length === 0 ? (
            <div className="col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
              <p>No Reels uploaded yet.</p>
            </div>
          ) : (
            userReels.map((reel) => (
              <div
                key={reel.id}
                className="relative h-60 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-lg group cursor-pointer"
              >
                <video
                  src={reel.videoUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                  <h5 className="font-bold text-xs truncate">{reel.title}</h5>
                  <span className="text-[10px] text-zinc-300">❤️ {reel.likesCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. GITHUB REPOSITORIES TAB */}
      {activeTab === 'github' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Github className="w-6 h-6 text-orange-400" />
              <div>
                <h4 className="font-bold text-sm text-white">
                  Connected GitHub: github.com/{profileUser.github || profileUser.username}
                </h4>
                <p className="text-xs text-zinc-400">
                  Showing synced pinned repositories & contribution stats
                </p>
              </div>
            </div>
            <a
              href={`https://github.com/${profileUser.github || profileUser.username}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700"
            >
              Open GitHub
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userRepos.map((repo) => (
              <div
                key={repo.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-3 hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-sm text-white hover:text-orange-400 flex items-center gap-1.5"
                    >
                      <Github className="w-4 h-4 text-orange-400" />
                      <span>{repo.name}</span>
                    </a>
                    {repo.isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{repo.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
                  <span className="text-orange-400 font-semibold">{repo.language}</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3 text-zinc-500" />
                      {repo.forks}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Website URL</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
