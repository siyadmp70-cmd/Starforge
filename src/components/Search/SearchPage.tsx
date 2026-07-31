import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { VerificationBadge } from '../Common/VerificationBadge';
import { Search, Filter, Code2, Briefcase, MapPin, Star, UserPlus, Check, MessageSquare, Bookmark, Flag } from 'lucide-react';

interface SearchPageProps {
  onOpenProfile: (username: string) => void;
  onOpenChatWith: (user: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onOpenProfile,
  onOpenChatWith,
}) => {
  const { users, currentUser, toggleFollow, toggleSaveDeveloper } = useAuth();
  const { reportUser } = useSocial();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');

  const techChips = [
    'All',
    'React',
    'Flutter',
    'Laravel',
    'Node.js',
    'Python',
    'Java',
    'AI',
    'TypeScript',
    'Go',
  ];

  const developers = users.filter((u) => u.role === 'developer' && !u.isBanned);

  const filteredDevelopers = developers.filter((dev) => {
    const matchesTerm =
      dev.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dev.country && dev.country.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTech =
      selectedTech === 'All' ||
      dev.skills.some((s) => s.toLowerCase() === selectedTech.toLowerCase());

    const matchesCountry =
      countryFilter === 'All' ||
      (dev.country && dev.country.toLowerCase() === countryFilter.toLowerCase());

    return matchesTerm && matchesTech && matchesCountry;
  });

  const handleReport = (dev: any) => {
    const reason = prompt(`Enter reason for reporting @${dev.username}:`);
    if (reason) {
      reportUser(dev.id, dev.username, 'User Report', reason);
      alert(`Report submitted for @${dev.username}. Admin will review shortly.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Search Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Find Top Developers</h3>
            <p className="text-xs text-zinc-400">
              Search by Username, Name, Skills, Country, or Frameworks
            </p>
          </div>
        </div>

        {/* Input bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search e.g. React, Alex, Germany, AI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Tech Chips Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <span>Filter by Technology</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {techChips.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedTech === tech
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Developers Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
            Verified Developers ({filteredDevelopers.length})
          </h4>
        </div>

        {filteredDevelopers.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center text-zinc-500">
            <Code2 className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p>No developers match your search criteria.</p>
          </div>
        ) : (
          filteredDevelopers.map((dev) => (
            <div
              key={dev.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl hover:border-zinc-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Profile Main info */}
              <div
                onClick={() => onOpenProfile(dev.username)}
                className="flex items-start gap-4 cursor-pointer group flex-1"
              >
                <div className="relative">
                  <img
                    src={dev.avatar}
                    alt={dev.username}
                    className="w-14 h-14 rounded-2xl object-cover border border-zinc-700 group-hover:scale-105 transition-transform"
                  />
                  {dev.isVerified && (
                    <div className="absolute -bottom-1 -right-1">
                      <VerificationBadge size="md" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white group-hover:text-orange-400 transition">
                      {dev.fullName}
                    </h4>
                    {dev.isVerified && <VerificationBadge size="sm" />}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="text-orange-400 font-medium">@{dev.username}</span>
                    {dev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {dev.location}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 pt-1">{dev.bio}</p>

                  {/* Skills chips */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {dev.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Client / Interaction Actions */}
              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800/80">
                {/* Save Favorite Developer */}
                <button
                  onClick={() => toggleSaveDeveloper(dev.id)}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  title="Bookmark Developer"
                >
                  <Bookmark className="w-4 h-4 text-orange-400" />
                </button>

                {/* Direct Message */}
                <button
                  onClick={() => onOpenChatWith(dev)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                  <span>Message</span>
                </button>

                {/* Hire Me Button */}
                <button
                  onClick={() => {
                    alert(`Hire inquiry sent to @${dev.username}! They will receive your notification.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition hover:scale-105 flex items-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Hire Me</span>
                </button>

                {/* Report User */}
                <button
                  onClick={() => handleReport(dev)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition"
                  title="Report Profile"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
