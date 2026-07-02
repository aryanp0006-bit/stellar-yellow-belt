export const ERROR_MESSAGES = {
  WALLET_NOT_FOUND: "Wallet not found. Please install a Stellar wallet.",
  INSUFFICIENT_BALANCE: "Insufficient balance. Minimum 0.5 XLM required.",
  WALLET_REJECTED: "Wallet connection rejected by user.",
  CONNECTION_FAILED: "Wallet connection failed. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  TRANSACTION_FAILED: "Transaction failed. Please try again.",
  UNAUTHORIZED: "Unauthorized access.",
  UNKNOWN: "Something went wrong. Please try again.",
};

export const handleError = (error) => {
  console.error("Error:", error);
  return error?.message || ERROR_MESSAGES.UNKNOWN;
};