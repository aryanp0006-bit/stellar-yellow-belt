import { useState, useEffect } from 'react';
import { getPollResults } from '../services/contractService';
import VotingInterface from './VotingInterface';
import RealTimeResults from './RealTimeResults';
import LoadingSpinner from './LoadingSpinner';
import { ExternalLink } from 'lucide-react';

export default function PollCard({ poll }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getPollResults(poll.id);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Fetch results error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    
    const interval = setInterval(fetchResults, 2000);
    return () => clearInterval(interval);
  }, [poll.id]);

  const totalVotes = (results?.yes || 0) + (results?.no || 0) || 1;
  const yesPercent = ((results?.yes || 0) / totalVotes * 100).toFixed(1);
  const noPercent = ((results?.no || 0) / totalVotes * 100).toFixed(1);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/60 transition">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">{poll.question}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>📅 {new Date(poll.createdAt).toLocaleDateString()}</span>
          {poll.transactionHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${poll.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              TX <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-3 bg-red-900/20 text-red-400 rounded text-sm mb-4">
          {error}
        </div>
      ) : (
        <RealTimeResults
          yesVotes={results?.yes || 0}
          noVotes={results?.no || 0}
          yesPercent={yesPercent}
          noPercent={noPercent}
          totalVotes={totalVotes}
        />
      )}

      <div className="mt-6">
        <VotingInterface pollId={poll.id} />
      </div>
    </div>
  );
}