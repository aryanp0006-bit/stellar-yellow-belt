
import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { votePoll, submitTransaction } from '../services/contractService';
import { getWalletBalance } from '../services/walletService';
import { useTransactionStore } from '../store/transactionStore';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';
import { ERROR_MESSAGES } from '../services/errorHandler';

export default function VotingInterface({ pollId }) {
  const { wallet, balance } = useWalletStore();
  const { addTransaction, setCurrentTransaction } = useTransactionStore();

  const [voted, setVoted] = useState(false);
  const [voteOption, setVoteOption] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLocalResults = (option) => {
    const key = `poll_results_${pollId}`;
    const existing = localStorage.getItem(key);
    const results = existing ? JSON.parse(existing) : { yes: 0, no: 0 };
    results[option] = (results[option] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(results));
  };

  const handleVote = async (option) => {
    try {
      setLoading(true);
      setError(null);

      const currentBalance = await getWalletBalance(wallet.address);
      if (currentBalance < 0.5) {
        setError(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        toast.error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        return;
      }

      const voteTx = await votePoll(wallet, pollId, option);

      const txData = {
        id: `vote-${Date.now()}`,
        hash: null,
        status: 'pending',
        method: 'vote',
        pollId,
        option,
        timestamp: new Date().toISOString(),
        walletAddress: wallet.address
      };

      addTransaction(txData);
      setCurrentTransaction(txData);

      const submitted = await submitTransaction(wallet, voteTx.xdr);

      addTransaction({
        ...txData,
        hash: submitted.hash,
        status: 'success',
        ledger: submitted.ledger
      });

      updateLocalResults(option);

      setVoted(true);
      setVoteOption(option);
      setTxHash(submitted.hash);
      toast.success(`✅ Vote recorded! TX: ${submitted.hash.slice(0, 10)}...`);

    } catch (err) {
      const errorMsg = err.message || 'Failed to vote';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Vote error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (voted) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
        <p className="font-bold text-green-400 text-center">✅ Vote Recorded!</p>
        <p className="text-sm text-green-300 mt-1 text-center">
          You voted: <span className="font-bold">{voteOption === 'yes' ? '👍 Yes' : '👎 No'}</span>
        </p>

        {txHash ? (
          <div className="mt-3 pt-3 border-t border-green-600/20">
            <p className="text-xs text-gray-400 mb-1">📋 Transaction Hash</p>
            <div className="flex items-center gap-2 bg-black/30 rounded px-2 py-1 overflow-hidden">
              <span className="text-xs text-cyan-400 font-mono truncate flex-1">{txHash}</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 underline whitespace-nowrap"
              >
                View ↗
              </a>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 mt-2 text-center">⏳ Confirming on-chain...</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleVote('yes')}
          disabled={loading || voted}
          className="px-4 py-3 bg-green-600/20 hover:bg-green-600/40 border border-green-600/50 text-green-400 font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : '👍'}
          Yes
        </button>

        <button
          onClick={() => handleVote('no')}
          disabled={loading || voted}
          className="px-4 py-3 bg-red-600/20 hover:bg-red-600/40 border border-red-600/50 text-red-400 font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : '👎'}
          No
        </button>
      </div>
    </div>
  );
}
