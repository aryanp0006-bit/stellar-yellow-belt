import { AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const WALLETS = [
  {
    name: 'Freighter',
    icon: '🦾',
    description: 'Popular Stellar wallet',
    url: 'https://freighter.app'
  },
  {
    name: 'eBull',
    icon: '🐂',
    description: 'Fast and secure',
    url: 'https://ebull.io'
  },
  {
    name: 'Albedo',
    icon: '🌙',
    description: 'Ledger-compatible',
    url: 'https://albedo.link'
  }
];

export default function MultiWalletSelector({ onSelectWallet, loading, error }) {
  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
          <div>
            <p className="font-bold text-red-400">Connection Error</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {WALLETS.map((wallet) => (
          <button
            key={wallet.name}
            onClick={() => onSelectWallet(wallet.name)}
            disabled={loading}
            className="p-4 border-2 border-cyan-500/20 rounded-lg hover:border-cyan-500/60 hover:bg-cyan-500/5 transition disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-2xl mb-2">{wallet.icon}</p>
                <p className="font-bold text-white">{wallet.name}</p>
                <p className="text-sm text-gray-400">{wallet.description}</p>
              </div>
              {loading && <LoadingSpinner size="sm" />}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Don't have a wallet? 
        <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-1">
          Install Freighter
        </a>
      </p>
    </div>
  );
}