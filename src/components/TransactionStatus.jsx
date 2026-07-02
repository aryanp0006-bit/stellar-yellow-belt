import { useTransactionStore } from '../store/transactionStore';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function TransactionStatus() {
  const { transactions } = useTransactionStore();
  const [expanded, setExpanded] = useState(true);

  if (transactions.length === 0) return null;

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-stellar-dark/50 backdrop-blur-sm border border-stellar-cyan/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            📊 Recent Transactions ({transactions.length})
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white transition"
          >
            {expanded ? '▼' : '▶'}
          </button>
        </div>

        {expanded && (
          <div className="space-y-3">
            {recentTx.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-stellar-dark/50 border border-stellar-cyan/10 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {tx.method === 'createPoll' ? '📝 Create Poll' : '🗳️ Vote'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tx.timestamp && new Date(tx.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {tx.status === 'pending' && (
                      <span className="inline-block px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs font-bold">
                        ⏳ Pending
                      </span>
                    )}
                    {tx.status === 'success' && (
                      <span className="inline-block px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-bold">
                        ✅ Success
                      </span>
                    )}
                    {tx.status === 'failed' && (
                      <span className="inline-block px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold">
                        ❌ Failed
                      </span>
                    )}
                  </div>

                  {tx.hash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stellar-cyan hover:text-stellar-cyan/80 transition"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}