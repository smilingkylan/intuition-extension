import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getAtomCreatorService } from '../atom-creator-service'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log('create-atoms handler called with:', req.body)
  
  try {
    const atomCreatorService = getAtomCreatorService()
    const { usernames } = req.body
    
    if (!usernames || !Array.isArray(usernames)) {
      throw new Error('Usernames array is required')
    }

    // Process usernames in background (non-blocking)
    atomCreatorService.processTwitterUsernames(usernames).catch(error => {
      console.error('Background atom creation failed:', error)
    })

    // Get current status
    const pendingCreations = atomCreatorService.getPendingCreations()

    res.send({ 
      success: true, 
      message: 'Atom creation initiated',
      usernames,
      pendingCreations 
    })
  } catch (error: any) {
    console.error('Create atoms error:', error)
    res.send({ success: false, error: error.message || 'Unknown error' })
  }
}

export default handler
