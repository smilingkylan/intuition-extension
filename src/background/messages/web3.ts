// This file is auto-loaded by Plasmo for handling messages
import type { PlasmoMessaging } from "@plasmohq/messaging"
import backgroundService from '../index'

// Helper function to convert BigInt values to strings in an object
const replaceBigInt = (val: any): any => {
  if (typeof val === 'bigint') {
    return val.toString()
  }
  if (Array.isArray(val)) {
    return val.map(replaceBigInt)
  }
  if (typeof val === 'object' && val !== null) {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [k, replaceBigInt(v)])
    )
  }
  return val
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log('web3 message handler called with:', req.body)
  
  const web3Service = backgroundService.getWeb3Service()

  // Support both old action-based format and new method-based format
  if (req.body?.method) {
    // New dynamic method calling (like x-turbo-plasmo)
    try {
      console.log('Calling method:', req.body.method, 'with params:', req.body.params)
      const response = await (web3Service as any)[req.body.method](...(req.body.params || []))
      console.log('Method response:', response)
      
      // Convert BigInt values to strings before serializing
      const serializable = replaceBigInt(response)
      res.send(serializable)
    } catch (error: any) {
      console.error('Method call error:', error)
      res.send({ success: false, error: error.message || 'Unknown error' })
    }
  } else {
    // Legacy action-based format (for backward compatibility)
    const { action, data } = req.body

    try {
      switch (action) {
        case 'CONNECT_WALLET':
          const result = await web3Service.connectWallet(data?.account, data?.chainId)
          res.send({ success: true, data: result })
          break
          
        case 'DISCONNECT_WALLET':
          await web3Service.disconnect()
          res.send({ success: true })
          break
          
        case 'GET_CONNECTION_STATE':
          const state = await web3Service.getConnectionState()
          res.send({ success: true, data: state })
          break
          
        case 'GET_WALLET_DATA':
          const walletData = web3Service.getWalletData()
          res.send({ success: true, data: walletData })
          break
          
        default:
          res.send({ success: false, error: 'Unknown action' })
      }
    } catch (error: any) {
      console.error('Action error:', error)
      res.send({ success: false, error: error.message || 'Unknown error' })
    }
  }
}

export default handler 