/**
 * Parse transaction errors into user-friendly messages
 */
export function parseTransactionError(error: any): Error {
  let message = 'Transaction failed'
  
  if (error.message?.includes('insufficient funds')) {
    message = 'Insufficient funds for transaction'
  } else if (error.message?.includes('InsufficientAssets')) {
    message = 'Deposit amount is too small'
  } else if (error.message?.includes('InsufficientBalance')) {
    message = 'Insufficient balance for transaction. Please check your wallet balance.'
  } else if (error.message?.includes('user rejected')) {
    message = 'Transaction was rejected'
  } else if (error.message?.includes('User denied')) {
    message = 'Transaction was denied by user'
  } else if (error.cause?.reason) {
    message = `Contract error: ${error.cause.reason}`
  } else if (error.shortMessage) {
    message = error.shortMessage
  } else if (error.message) {
    message = error.message
  }
  
  return new Error(message)
}

/**
 * Check if an error is a user cancellation
 */
export function isUserRejectionError(error: any): boolean {
  return error.message?.includes('user rejected') || 
         error.message?.includes('User denied') ||
         error.message?.includes('User cancelled')
}

/**
 * Check if an error is due to insufficient funds
 */
export function isInsufficientFundsError(error: any): boolean {
  return error.message?.includes('insufficient funds') || 
         error.message?.includes('InsufficientBalance') ||
         error.message?.includes('InsufficientAssets')
}
