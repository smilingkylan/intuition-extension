export enum CreateSocialAtomSteps {
  Confirm = 'confirm',
  Image = 'image', 
  Identity = 'identity',
  Review = 'review',
  Process = 'process',
  Success = 'success'
}

export interface SocialAtomFormData {
  // Base social atom
  socialAtomName: string
  socialAtomDescription: string
  
  // Optional image
  hasImage: boolean
  imageName?: string
  imageDescription?: string
  imageUrl?: string
  
  // Optional real identity
  hasIdentity: boolean
  identityName?: string
  identityDescription?: string
  identityType?: 'person' | 'organization'
}

export interface TransactionData {
  atomsToCreate: Array<{
    uri: string
    stake: string  // Changed from bigint to string
  }>
  triplesToCreate: Array<{
    subjectId: string
    predicateId: string
    objectId: string
    stake: string  // Changed from bigint to string
  }>
}

export interface CreatedAtoms {
  social?: string
  image?: string
  identity?: string
} 