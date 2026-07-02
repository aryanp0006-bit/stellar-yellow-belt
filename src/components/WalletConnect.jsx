import { useState } from 'react';
import { connectWallet, disconnectWallet, getWalletBalance } from '../services/walletService';
import { useWalletStore } from '../store/walletStore';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import MultiWalletSelector from './MultiWalletSelector';
import { ERROR_MESSAGES } from '../services/errorHandler';

export default function WalletConnect({ showButton = false }) {
  const { wallet, walletName, setWallet, setBalance, clearWallet, loading, setLoading, error, setError } = useWalletStore();
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const handleConnectWallet = async (selectedWalletName) => {
    try {
      setLoading(true);
      setError(null);

      const connectedWallet = await connectWallet(selectedWalletName);

      if (!connectedWallet.address) {
        setError(ERROR_MESSAGES.WALLET_NOT_FOUND);
        toast.error(ERROR_MESSAGES.WALLET_NOT_FOUND);
        return;
      }

      const balance = await getWalletBalance(connectedWallet.address);

      if (balance < 0.5) {
        setError(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        toast.error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        return;
      }

      localStorage.setItem('stellar_wallet', JSON.stringify({
        address: connectedWallet.address,
        wallet: selectedWalletName,
        timestamp: new Date().toISOString()
      }));

      setWallet(connectedWallet, selectedWalletName);
      setBalance(balance);
      setShowWalletSelector(false);
      toast.success(`✅ Connected with ${selectedWalletName}!`);

    } catch (err) {
      const errorMsg = err.message || ERROR_MESSAGES.WALLET_REJECTED;
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    clearWallet();
    localStorage.removeItem('stellar_wallet');
    toast.success('Wallet disconnected');
  };

  if (wallet) {
    return showButton ? (
      <button
        onClick={handleDisconnect}
        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
      >
        <LogOut size={16} />
        Disconnect
      </button>
    ) : null;
  }

  return (
    <div className="w-full max-w-md">
      {!showWalletSelector ? (
        <button
          onClick={() => setShowWalletSelector(true)}
          disabled={loading}
          className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Connecting...' : '🔗 Connect Wallet'}
        </button>
      ) : (
        <MultiWalletSelector
          onSelectWallet={handleConnectWallet}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}