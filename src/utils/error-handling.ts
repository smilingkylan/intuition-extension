/**
 * Parse transaction errors into user-friendly messages
 */
export function parseTransactionError(error: any): Error {
  console.error('[parseTransactionError] Raw error:', error)
  
  let message = 'Transaction failed'
  
  // Check for BigInt conversion errors
  if (error.message?.includes('Cannot convert') && error.message?.includes('to a BigInt')) {
    message = 'Invalid value format. Please check your input values.'
    console.error('[parseTransactionError] BigInt conversion error:', {
      errorMessage: error.message,
      errorStack: error.stack
    })
  } else if (error.message?.includes('insufficient funds')) {
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
  
  console.error('[parseTransactionError] Parsed message:', message)
  return new Error(message)
}

/**
 * Check if an error is a user cancellation
 */
export function isUserRejectionError(error: any): boolean {
  return error.message?.includes('user rejected') || 
         error.message?.includes('User denied') ||
         error.code === 4001 // MetaMask user rejection code
}

/**
 * Check if an error is due to insufficient funds
 */
export function isInsufficientFundsError(error: any): boolean {
  return error.message?.includes('insufficient funds') || 
         error.message?.includes('InsufficientBalance') ||
         error.message?.includes('InsufficientAssets')
}
