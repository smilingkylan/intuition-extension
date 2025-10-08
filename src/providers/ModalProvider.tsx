import React, { createContext, useContext, useState, useCallback } from 'react'
import { CreateTripleFlow } from '../components/CreateTripleFlow'
import type { AtomMatch } from '../lib/atom-queue/types'

interface CreateTripleModalProps {
  atomData: {
    termId: string
    label: string
    displayLabel?: string
  }
}

interface ModalConfig {
  id: string
  type: 'createTriple' | 'createAtom' | 'success' // extensible for future modal types
  props?: any
  onClose?: () => void
}

interface ModalContextType {
  openModal: (config: ModalConfig) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  isModalOpen: (id: string) => boolean
  modalStack: ModalConfig[]
}

const ModalContext = createContext<ModalContextType | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalStack, setModalStack] = useState<ModalConfig[]>([])

  const openModal = useCallback((config: ModalConfig) => {
    console.log('[ModalProvider] Opening modal:', config)
    setModalStack(prev => [...prev, config])
  }, [])

  const closeModal = useCallback((id: string) => {
    console.log('[ModalProvider] Closing modal:', id)
    setModalStack(prev => prev.filter(modal => modal.id !== id))
  }, [])

  const closeAllModals = useCallback(() => {
    console.log('[ModalProvider] Closing all modals')
    setModalStack([])
  }, [])

  const isModalOpen = useCallback((id: string) => {
    return modalStack.some(modal => modal.id === id)
  }, [modalStack])

  const value = {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    modalStack
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Render all modals in the stack */}
      {modalStack.map(modal => {
        switch (modal.type) {
          case 'createTriple':
            return (
              <CreateTripleFlow
                key={modal.id}
                {...(modal.props as CreateTripleModalProps)}
                onClose={() => {
                  modal.onClose?.()
                  closeModal(modal.id)
                }}
              />
            )
          // Add other modal types here as needed
          case 'createAtom':
            // Placeholder for future implementation
            return null
          case 'success':
            // Placeholder for future implementation
            return null
          default:
            return null
        }
      })}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}

// Helper hook for creating a triple modal
export const useCreateTripleModal = () => {
  const { openModal } = useModal()
  
  return useCallback((atomData: CreateTripleModalProps['atomData']) => {
    const modalId = `create-triple-${atomData.termId}-${Date.now()}`
    openModal({
      id: modalId,
      type: 'createTriple',
      props: { atomData }
    })
    return modalId
  }, [openModal])
}
