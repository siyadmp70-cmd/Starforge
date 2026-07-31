import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { AIAnalysisResult } from '../../types';
import { VerificationBadge } from '../Common/VerificationBadge';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';

export const AIAssistantCard: React.FC<{
  onSelectUserToVerify?: (userId: string) => void;
}> = () => {
  const { users, verifyUser } = useAuth();
  const { generateAIVerification } = useSocial();

  const [selectedUsername, setSelectedUsername] = useState<string>('alex_dev');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  const developerList = users.filter((u) => u.role === 'developer');
  const targetUser = users.find((u) => u.username.toLowerCase() === selectedUsername.toLowerCase());

  const handleRunAIAnalysis = async () => {
    if (!selectedUsername) return;
    setLoading(true);
    const result = await generateAIVerification(selectedUsername);
    setAnalysisResult(result);
    setLoading(false);
  };

  const riskColors = {
    Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    High: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>AI Verification Assistant</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                Gemini 3.6 Flash
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Automated deep analysis of profile completeness, GitHub activity, project quality & scam indicators
            </p>
          </div>
        </div>
      </div>

      {/* Select Developer to Analyze */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Select Developer Username:
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <select
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {developerList.map((dev) => (
                <option key={dev.id} value={dev.username}>
                  @{dev.username} - {dev.fullName} {dev.isVerified ? '(Verified)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={loading}
          className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run AI Audit</span>
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Result Display */}
      {analysisResult && targetUser && (
        <div className="space-y-6 pt-4 border-t border-zinc-800 animate-in fade-in">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Trust Score Radial Card */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Trust Score</span>
                <div className="text-3xl font-extrabold text-white">{analysisResult.trustScore}/100</div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white ${
                  analysisResult.trustScore >= 80
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : analysisResult.trustScore >= 50
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-red-500/20 border border-red-500/40 text-red-400'
                }`}
              >
                {analysisResult.trustScore}%
              </div>
            </div>

            {/* Risk Level */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Risk Assessment</span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    riskColors[analysisResult.riskLevel]
                  }`}
                >
                  {analysisResult.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-500">
                AI Recommendation
              </span>
              <div className="font-extrabold text-sm text-orange-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span>{analysisResult.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Metric Progress Bars */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Verification Audit Metrics
            </h5>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>Profile Completeness</span>
                  <span>{analysisResult.metrics.profileCompleteness}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${analysisResult.metrics.profileCompleteness}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>GitHub Repository Quality</span>
                  <span>{analysisResult.metrics.githubActivityScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${analysisResult.metrics.githubActivityScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 font-semibold mb-1">
                  <span>Project Portfolio Authenticity</span>
                  <span>{analysisResult.metrics.projectQualityScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${analysisResult.metrics.projectQualityScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Paragraph */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-orange-400" />
              <span>AI Audit Explanation</span>
            </h5>
            <p className="text-zinc-300 leading-relaxed">{analysisResult.explanation}</p>
          </div>

          {/* Signals Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
              <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Positive Signals</span>
              </h5>
              <ul className="space-y-1 text-zinc-300">
                {analysisResult.positiveSignals.map((sig, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2 text-xs">
              <h5 className="font-bold text-red-400 flex items-center gap-1.5">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Risk Signals</span>
              </h5>
              <ul className="space-y-1 text-zinc-300">
                {analysisResult.riskSignals.map((sig, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Final Admin Action Triggers */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-zinc-400">Decision for </span>
              <span className="font-bold text-white">@{targetUser.username}:</span>
              <span className="ml-2 font-bold text-orange-400">
                Current Status: {targetUser.isVerified ? 'Orange Badge Granted' : 'Unverified'}
              </span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {targetUser.isVerified ? (
                <button
                  onClick={() => {
                    verifyUser(targetUser.id, false);
                    alert(`Removed verification badge from @${targetUser.username}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs border border-red-500/30 transition"
                >
                  Remove Verification
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      verifyUser(targetUser.id, true);
                      alert(`Orange Verification Badge granted to @${targetUser.username}!`);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    <VerificationBadge size="sm" />
                    <span>Grant Orange Badge</span>
                  </button>

                  <button
                    onClick={() => alert(`Verification rejected for @${targetUser.username}.`)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs border border-zinc-700 transition"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
