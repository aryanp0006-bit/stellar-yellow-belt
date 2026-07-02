export default function RealTimeResults({ yesVotes, noVotes, yesPercent, noPercent, totalVotes }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-bold text-green-400">👍 Yes</span>
          <span className="text-sm text-gray-400">{yesPercent}% ({yesVotes} votes)</span>
        </div>
        <div className="w-full h-8 bg-slate-900 border border-cyan-500/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${yesPercent}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="font-bold text-red-400">👎 No</span>
          <span className="text-sm text-gray-400">{noPercent}% ({noVotes} votes)</span>
        </div>
        <div className="w-full h-8 bg-slate-900 border border-cyan-500/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
            style={{ width: `${noPercent}%` }}
          />
        </div>
      </div>

      <div className="pt-2 text-center text-sm text-gray-400">
        Total Votes: <span className="font-bold text-cyan-400">{totalVotes}</span>
      </div>
    </div>
  );
}