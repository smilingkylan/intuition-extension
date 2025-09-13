// todo: delete?

import { cn } from '~/lib/utils'
import { uploadJSONToIPFS } from '~/util'
import { SidebarAtom } from '@/components/Sidebar/SidebarAtom'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { sendToBackground } from '@plasmohq/messaging'
import { CONFIG } from '~/constants/web3'
import { Button } from '../ui/button'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { AddRelatedImageSuccess } from './AddRelatedImageSuccess'

const { HAS_RELATED_IMAGE_VAULT_ID } = CONFIG

export const AddRelatedImageConfirm = ({
  form,
  onClickBack,
  onSuccess,
  atom,
}: {
  form: any
  onClickBack: () => void
  onSuccess?: () => void
  atom
}) => {
  const dispatch = useDispatch()
  const [isAtomsCreated, setIsAtomsCreated] = useState(false)
  const [isTriplesCreated, setIsTriplesCreated] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  // existing vault ids are for triples creation faillure
  const [existingAtomVaultIds, setExistingAtomVaultIds] = useState(null)
  const [existingAtomHash, setExistingAtomHash] = useState(null)

  const [finalData, setFinalData] = useState(null)
  const hasImage = !!form.watch('associated_image_url')

  const generateAtomJsons = () => {
    const atomJsons = [
      {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: form.watch('associated_image_name'),
        description: form.watch('associated_image_description'),
        image: form.watch('associated_image_url'), // ?
      },
    ]

    console.log('atomJsons', atomJsons)
    return atomJsons
  }

  const onClickSubmit = async () => {
    try {
      setIsProcessing(true)
      let vaultIds = null
      let atomHash = null
      if (!existingAtomVaultIds) {
        const { vaultIds: urlAtomVaultIds, hash: urlAtomHash } =
          await createAtoms()
        vaultIds = urlAtomVaultIds
        atomHash = urlAtomHash
      } else {
        vaultIds = existingAtomVaultIds
        atomHash = existingAtomHash
      }
      console.log('onClickSubmit vaultIds', vaultIds)

      let tripleVaultIds = null
      let tripleHash = null
      if (hasImage) {
        const tripleData = await createTriples(vaultIds)
        tripleVaultIds = tripleData.vaultIds
        tripleHash = tripleData.hash
        setIsTriplesCreated(true)
        setFinalData({
          atomVaultIds: vaultIds,
          atomHash,
          tripleVaultIds,
          tripleHash,
        })
      } else {
        setFinalData({
          atomVaultIds: vaultIds,
          atomHash,
        })
      }
      setTimeout(onSuccess, 3000)
      setTimeout(onSuccess, 7000)
      setTimeout(onSuccess, 11000)
    } catch (err) {
      console.error('onClickSubmit error', err)
      toast.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const createAtoms = async () => {
    setExistingAtomVaultIds(null)
    try {
      const atomJsons = generateAtomJsons()
      const data = await uploadJSONToIPFS(atomJsons) // move fxn to fetch
      console.log('uploadAtomsdata', data)
      const [imageAtom] = data
      const {
        hash: imageAtomHash,
        vaultIds: imageAtomVaultIds,
        error: imageAtomError,
      } = await sendToBackground({
        name: 'web3',
        body: {
          method: 'batchCreateAtom',
          params: [[`ipfs://${imageAtom.IpfsHash}`]],
        },
      })
      if (imageAtomError) {
        throw new Error(imageAtomError)
      }
      if (!imageAtomHash)
        throw new Error('Atom creation transaction failed (no hash)')
      console.log('imageAtomVaultIds', imageAtomVaultIds)
      console.log('imageAtomHash', imageAtomHash)
      setExistingAtomVaultIds(imageAtomVaultIds)
      setExistingAtomHash(imageAtomHash)
      setIsAtomsCreated(true)
      return { vaultIds: imageAtomVaultIds, hash: imageAtomHash }
    } catch (err) {
      console.error('createAtoms error', err)
      toast.error(err)
      setIsProcessing(false)
    }
  }

  const createTriples = async (vaultIds: bigint[]) => {
    try {
      const [imageVaultId] = vaultIds
      const batchCreateTripleParams = [
        {
          subjectId: atom.id,
          predicateId: HAS_RELATED_IMAGE_VAULT_ID,
          objectId: imageVaultId,
        },
      ]
      const {
        vaultIds: tripleVaultIds,
        hash: tripleHash,
        error: tripleError,
      } = await sendToBackground({
        name: 'web3',
        body: {
          method: 'batchCreateTriple',
          params: [batchCreateTripleParams],
        },
      })
      if (tripleError) {
        throw new Error(tripleError)
      }
      if (!tripleHash)
        throw new Error('Triple creation transaction failed (no hash)')
      if (!Array.isArray(tripleVaultIds))
        throw new Error('Tripls vault IDs not created')
      console.log('tripleHash', tripleHash)
      return { vaultIds: tripleVaultIds, hash: tripleHash }
    } catch (err) {
      console.error('createTriples error', err)
      toast.error(err)
    } finally {
      setIsProcessing(false)
    }
  }
  console.log('AddRelatedImageConfirm existingVaultIds', existingAtomVaultIds)
  if (finalData) return <AddRelatedImageSuccess summary={finalData} />

  return (
    <div className="flex flex-col gap-4 justify-between">
      <CardHeader>
        <CardTitle>Sign Transactions</CardTitle>
        <CardDescription>
          Sign these two transactions to create the atom and triple
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border shadow p-2 mb-6">
          <SidebarAtom
            atomData={atom}
            imageUrl={form.watch('associated_image_url')}
          />
        </div>
        <div className="gap-8">
          <h3>1. Create atoms:</h3>
          <ul className={cn('ml-8', !isAtomsCreated ? 'list-disc' : '')}>
            <li className={isAtomsCreated ? 'custom-check' : ''}>Image</li>
          </ul>
          <br />
          <h3>2. Create triple:</h3>
          <ul className={cn('ml-8', !isTriplesCreated ? 'list-disc' : '')}>
            <li className={isTriplesCreated ? 'custom-check' : ''}>
              Image is associated with atom
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row justify-end gap-2 z-50">
        <Button
          onClick={onClickBack}
          variant="secondary"
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          onClick={onClickSubmit}
          disabled={isProcessing}
          className="min-w-[100px]"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : existingAtomVaultIds ? (
            'Resubmit'
          ) : (
            'Submit'
          )}
        </Button>
      </CardFooter>
    </div>
  )
}
