import type { PlasmoMessaging } from "@plasmohq/messaging"
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createAtoms, createTriples, eventParseAtomCreated } from '@0xintuition/protocol'
import { CONFIG } from '~/constants'

// SECURITY WARNING: This is for development only. Never hardcode private keys in production!
const PRIVATE_KEY = '0xc1aaa4a40720ca39bd3af71c4cd92f4b59edbc4cb8002c01571e7affa1068587'

const { ETH_RPC_URL, CHAIN_CONFIG } = CONFIG

interface CreateSocialAtomsRequest {
  atomsToCreate: Array<{
    uri: string
    stake: string
  }>
  formData: {
    hasImage: boolean
    hasIdentity: boolean
  }
}

const handler: PlasmoMessaging.MessageHandler<CreateSocialAtomsRequest> = async (req, res) => {
  console.log('create-social-atoms handler called with:', req.body)
  
  try {
    if (!PRIVATE_KEY || PRIVATE_KEY === '0x') {
      throw new Error('Private key not configured')
    }

    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)
    
    const walletClient = createWalletClient({
      account,
      chain: CHAIN_CONFIG,
      transport: http(ETH_RPC_URL)
    })

    const publicClient = createPublicClient({
      chain: CHAIN_CONFIG,
      transport: http(ETH_RPC_URL)
    })

    const config = {
      address: CONFIG.I8N_CONTRACT_ADDRESS as `0x${string}`,
      abi: CONFIG.CONTRACT_ABI,
      walletClient,
      publicClient,
    }

    // Create atoms
    const atomsToCreate = req.body.atomsToCreate.map(atom => ({
      data: atom.uri,
      initialDeposit: BigInt(atom.stake)
    }))

    const atomTx = await createAtoms(config, { atoms: atomsToCreate })
    
    // Wait for confirmation and parse events
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: atomTx 
    })
    
    const atomIds = receipt?.logs
      .map(log => {
        try {
          return eventParseAtomCreated(log)
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .map(event => event!.args.atomId.toString())

    // Store created atom IDs
    const createdAtoms: Record<string, string> = {
      social: atomIds[0],
    }
    
    if (req.body.formData.hasImage && atomIds[1]) {
      createdAtoms.image = atomIds[1]
    }
    
    if (req.body.formData.hasIdentity) {
      createdAtoms.identity = atomIds[atomIds.length - 1]
    }

    // Create triple relationships if needed
    const triplesToCreate = []
    
    if (createdAtoms.image) {
      triplesToCreate.push({
        subjectId: createdAtoms.social,
        predicateId: CONFIG.HAS_RELATED_IMAGE_VAULT_ID,
        objectId: createdAtoms.image,
        initialDeposit: parseEther('0.0004')
      })
    }

    if (createdAtoms.identity) {
      triplesToCreate.push({
        subjectId: createdAtoms.identity,
        predicateId: CONFIG.OWNS_ATOM_ID,
        objectId: createdAtoms.social,
        initialDeposit: parseEther('0.0004')
      })
    }

    // Create all triples if any
    if (triplesToCreate.length > 0) {
      await createTriples(config, { triples: triplesToCreate })
    }

    res.send({ 
      success: true,
      createdAtoms,
      transactionHash: atomTx
    })
  } catch (error: any) {
    console.error('Create social atoms error:', error)
    res.send({ 
      success: false, 
      error: error.message || 'Unknown error' 
    })
  }
}

export default handler 