import { useWalletStore } from '../store/walletStore';
import { disconnectWallet } from '../services/walletService';

export default function Navbar() {
  const { wallet, walletName, clearWallet } = useWalletStore();

  const handleDisconnect = () => {
    disconnectWallet();
    clearWallet();
  };

  return (
    <nav className="bg-black/40 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🗳️</span>
          <h1 className="text-2xl font-black text-cyan-400">
            Live Polls
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {wallet && (
            <>
              <div className="hidden md:block text-right">
                <p className="text-xs text-gray-400">Connected with</p>
                <p className="text-sm font-bold text-cyan-400">{walletName}</p>
                <p className="text-xs text-gray-500">{wallet.address?.slice(0, 10)}...</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}