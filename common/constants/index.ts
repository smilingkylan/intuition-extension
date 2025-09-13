import { BuildingIcon, CalendarIcon, UserIcon } from 'lucide-react'

export const AUTHOR_NOTES_KEY = 'myUsernameNotes'
export const TARGET_NOTES_KEY = 'targetNotes'
export const DRAFT_NOTE_KEY = 'draftNote'
export const AUTHOR_TARGET_NOTES_KEY = 'authorTargetNotes'

export const EthereumEvents = Object.freeze({
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CHAIN_CHANGED: 'chainChanged',
  ACCOUNTS_CHANGED: 'accountsChanged',
})

export const SCHEMA_TYPE_ICONS = {
  person: UserIcon,
  organization: BuildingIcon,
  product: CalendarIcon,
  event: CalendarIcon,
}

export * from './web3'