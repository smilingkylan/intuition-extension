import React, { createContext, useContext, useState, ReactNode } from 'react'
import { SocialAtomFormData, TransactionData, CreatedAtoms } from './types'

interface CreateAtomContextType {
  // Form data
  formData: Partial<SocialAtomFormData>
  setFormData: (data: Partial<SocialAtomFormData>) => void
  
  // Transaction data
  transactionData: TransactionData | null
  setTransactionData: (data: TransactionData | null) => void
  
  // Created atoms
  createdAtoms: CreatedAtoms
  setCreatedAtoms: (atoms: CreatedAtoms) => void
  
  // Initial params from AtomDisplay
  platform: string
  setPlatform: (platform: string) => void
  username: string
  setUsername: (username: string) => void
}

const CreateAtomContext = createContext<CreateAtomContextType | undefined>(undefined)

export function CreateAtomProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<Partial<SocialAtomFormData>>({
    hasImage: false,
    hasIdentity: false,
  })
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [createdAtoms, setCreatedAtoms] = useState<CreatedAtoms>({})
  const [platform, setPlatform] = useState('x.com')
  const [username, setUsername] = useState('')

  const setFormData = (data: Partial<SocialAtomFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }))
  }

  const value = {
    formData,
    setFormData,
    transactionData,
    setTransactionData,
    createdAtoms,
    setCreatedAtoms,
    platform,
    setPlatform,
    username,
    setUsername,
  }

  return (
    <CreateAtomContext.Provider value={value}>
      {children}
    </CreateAtomContext.Provider>
  )
}

export function useCreateAtom() {
  const context = useContext(CreateAtomContext)
  if (!context) {
    throw new Error('useCreateAtom must be used within CreateAtomProvider')
  }
  return context
} 