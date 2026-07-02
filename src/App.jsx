import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import WalletConnect from './components/WalletConnect';
import CreatePoll from './components/CreatePoll';
import PollCard from './components/PollCard';
import TransactionStatus from './components/TransactionStatus';
import { useWalletStore } from './store/walletStore';
import './index.css';

function App() {
  const { wallet } = useWalletStore();
  const [polls, setPolls] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  useEffect(() => {
    const savedPolls = localStorage.getItem('polls');
    if (savedPolls) {
      setPolls(JSON.parse(savedPolls));
    }
  }, []);

  const handleAddPoll = (poll) => {
    const updatedPolls = [poll, ...polls];
    setPolls(updatedPolls);
    localStorage.setItem('polls', JSON.stringify(updatedPolls));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <Toaster position="top-right" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!wallet ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <WalletConnect />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-5xl font-black text-cyan-400 mb-4">
                🗳️ Stellar Live Polls
              </h1>
              <p className="text-gray-300 text-lg">
                Real-time voting on Stellar blockchain
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setShowCreatePoll(!showCreatePoll)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300"
              >
                {showCreatePoll ? '✕ Cancel' : '+ Create New Poll'}
              </button>
            </div>

            {showCreatePoll && (
              <div className="max-w-2xl mx-auto">
                <CreatePoll 
                  onSuccess={() => setShowCreatePoll(false)}
                  onAddPoll={handleAddPoll}
                />
              </div>
            )}

            <TransactionStatus />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polls.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-gray-400 text-xl">No polls yet. Create one!</p>
                </div>
              ) : (
                polls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

