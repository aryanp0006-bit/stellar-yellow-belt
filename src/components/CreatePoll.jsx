import { useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { useTransactionStore } from '../store/transactionStore';
import { createPoll, submitTransaction } from '../services/contractService';
import { toast } from 'sonner';
import LoadingSpinner from './LoadingSpinner';

export default function CreatePoll({ onSuccess, onAddPoll }) {
  const { wallet } = useWalletStore();
  const { addTransaction, setCurrentTransaction } = useTransactionStore();

  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(3600);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreatePoll = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (!question.trim()) {
        setError('Question cannot be empty');
        return;
      }

      if (question.length > 200) {
        setError('Question must be less than 200 characters');
        return;
      }

      const endTime = Math.floor(Date.now() / 1000) + duration;
      const tempId = `poll-${Date.now()}`;

      // ✅ Optimistically add the poll IMMEDIATELY so Yes/No buttons appear right away
      if (onAddPoll) {
        onAddPoll({
          id: tempId,
          question,
          yesVotes: 0,
          noVotes: 0,
          endTime: new Date(endTime * 1000),
          createdAt: new Date(),
          transactionHash: null,
          status: 'pending',
        });
      }

      setQuestion('');
      onSuccess?.();

      // Build & submit transaction in background
      try {
        const pollTx = await createPoll(wallet, question, endTime);

        const txData = {
          id: tempId,
          hash: null,
          status: 'pending',
          method: 'createPoll',
          question,
          timestamp: new Date().toISOString(),
          walletAddress: wallet.address,
        };

        addTransaction(txData);
        setCurrentTransaction(txData);

        const submitted = await submitTransaction(wallet, pollTx.xdr);

        addTransaction({
          ...txData,
          hash: submitted.hash,
          status: 'success',
          ledger: submitted.ledger,
        });

        toast.success(`✅ Poll on-chain! TX: ${submitted.hash.slice(0, 10)}...`);
      } catch (txErr) {
        // Transaction failed but poll UI is already shown — log only
        addTransaction({
          id: tempId,
          hash: null,
          status: 'failed',
          method: 'createPoll',
          question,
          timestamp: new Date().toISOString(),
          walletAddress: wallet.address,
        });
        toast.error(`Transaction failed: ${txErr.message}`);
        console.error('TX error:', txErr);
      }

    } catch (err) {
      const errorMsg = err.message || 'Failed to create poll';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreatePoll} className="w-full bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-1">Create a New Poll</h2>
      <p className="text-sm text-gray-400 mb-6">
        Voters will choose between <span className="text-green-400 font-bold">👍 Yes</span> or <span className="text-red-400 font-bold">👎 No</span>
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">
            📝 Poll Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Will Bitcoin cross 75 lakh rupees this week?"
            maxLength="200"
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">{question.length}/200</p>
        </div>

        {/* Voting options preview */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">
            🗳️ Voting Options (fixed)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 bg-green-900/20 border border-green-600/40 rounded-lg text-green-400 font-bold text-center">
              👍 Yes
            </div>
            <div className="px-4 py-3 bg-red-900/20 border border-red-600/40 rounded-lg text-red-400 font-bold text-center">
              👎 No
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">
            ⏱️ Poll Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={loading}
            className="w-full px-4 py-3 bg-slate-900 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
          >
            <option value={3600}>1 Hour</option>
            <option value={86400}>1 Day</option>
            <option value={604800}>1 Week</option>
            <option value={2592000}>1 Month</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Creating Poll...
            </>
          ) : (
            '🚀 Create Poll'
          )}
        </button>
      </div>
    </form>
  );
}
