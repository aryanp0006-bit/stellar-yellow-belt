import { Horizon, TransactionBuilder, Networks, BASE_FEE, Operation } from '@stellar/stellar-sdk';
import freighterApi from '@stellar/freighter-api';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const createPoll = async (wallet, question, endTime) => {
  try {
    const account = await server.loadAccount(wallet.address);
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.manageData({
        name: `poll_${Date.now().toString().slice(-10)}`,
        value: question.slice(0, 64),
      }))
      .setTimeout(30)
      .build();

    return { xdr: transaction.toXDR() };
  } catch (error) {
    throw new Error(`Failed to create poll: ${error.message}`);
  }
};

export const votePoll = async (wallet, pollId, option) => {
  try {
    const account = await server.loadAccount(wallet.address);
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.manageData({
        name: `v_${pollId.slice(0, 20)}_${Date.now().toString().slice(-8)}`,
        value: `${option}`,
      }))
      .setTimeout(30)
      .build();

    return { xdr: transaction.toXDR() };
  } catch (error) {
    throw new Error(`Failed to vote: ${error.message}`);
  }
};

export const getPollResults = async (pollId) => {
  try {
    const stored = localStorage.getItem(`poll_results_${pollId}`);
    if (stored) return JSON.parse(stored);
    return { yes: 0, no: 0 };
  } catch (error) {
    return { yes: 0, no: 0 };
  }
};

export const submitTransaction = async (wallet, xdr) => {
  try {
    const result = await freighterApi.signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: NETWORK_PASSPHRASE,
      accountToSign: wallet.address,
    });

    const signedXdr = result?.signedTxXdr || result;
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const submitted = await server.submitTransaction(signedTx);
    return { hash: submitted.hash, ledger: submitted.ledger };
  } catch (error) {
    throw new Error(`Transaction failed: ${error.message}`);
  }
};
// import { Horizon, TransactionBuilder, Networks, BASE_FEE, Operation, Contract, nativeToScVal, scValToNative, Address } from '@stellar/stellar-sdk';
// import freighterApi from '@stellar/freighter-api';

// const server = new Horizon.Server(import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org');
// const NETWORK_PASSPHRASE = Networks.TESTNET;
// const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ADDRESS;
// const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://soroban-testnet.stellar.org';

// export const createPoll = async (wallet, question, endTime) => {
//   try {
//     const account = await server.loadAccount(wallet.address);
//     const transaction = new TransactionBuilder(account, {
//       fee: BASE_FEE,
//       networkPassphrase: NETWORK_PASSPHRASE,
//     })
//       .addOperation(Operation.manageData({
//         name: `poll_${Date.now().toString().slice(-10)}`,
//         value: question.slice(0, 64),
//       }))
//       .setTimeout(30)
//       .build();

//     return { xdr: transaction.toXDR() };
//   } catch (error) {
//     throw new Error(`Failed to create poll: ${error.message}`);
//   }
// };

// export const votePoll = async (wallet, pollId, option) => {
//   try {
//     const account = await server.loadAccount(wallet.address);
//     const transaction = new TransactionBuilder(account, {
//       fee: BASE_FEE,
//       networkPassphrase: NETWORK_PASSPHRASE,
//     })
//       .addOperation(Operation.manageData({
//         name: `v_${pollId.slice(0, 20)}_${Date.now().toString().slice(-8)}`,
//         value: `${option}`,
//       }))
//       .setTimeout(30)
//       .build();

//     return { xdr: transaction.toXDR() };
//   } catch (error) {
//     throw new Error(`Failed to vote: ${error.message}`);
//   }
// };

// export const getPollResults = async (pollId) => {
//   try {
//     const stored = localStorage.getItem(`poll_results_${pollId}`);
//     if (stored) return JSON.parse(stored);
//     return { yes: 0, no: 0 };
//   } catch (error) {
//     return { yes: 0, no: 0 };
//   }
// };

// export const submitTransaction = async (wallet, xdr) => {
//   try {
//     const result = await freighterApi.signTransaction(xdr, {
//       network: 'TESTNET',
//       networkPassphrase: NETWORK_PASSPHRASE,
//       accountToSign: wallet.address,
//     });

//     const signedXdr = result?.signedTxXdr || result;
//     const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
//     const submitted = await server.submitTransaction(signedTx);
//     return { hash: submitted.hash, ledger: submitted.ledger };
//   } catch (error) {
//     throw new Error(`Transaction failed: ${error.message}`);
//   }
// };

// export const getContractId = () => CONTRACT_ID;