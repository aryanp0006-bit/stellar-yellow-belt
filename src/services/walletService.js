import { Horizon } from '@stellar/stellar-sdk';
import freighterApi from '@stellar/freighter-api';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

export const connectWallet = async (walletName) => {
  try {
    if (walletName === 'Freighter') {
      const connected = await freighterApi.isConnected();
      if (!connected) {
        throw new Error('Freighter wallet not detected. Please unlock it.');
      }
      await freighterApi.requestAccess();
      const result = await freighterApi.getAddress();
      const address = result?.address || result;
      return { address, walletName: 'Freighter' };
    }
    throw new Error(`${walletName} wallet coming soon`);
  } catch (error) {
    throw error;
  }
};

export const disconnectWallet = () => {
  localStorage.removeItem('stellar_wallet');
};

export const getWalletBalance = async (address) => {
  try {
    const account = await server.loadAccount(address);
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error) {
    console.error('Balance fetch error:', error);
    return 0;
  }
};