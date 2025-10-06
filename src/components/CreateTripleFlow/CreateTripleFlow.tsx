import React, { useState, useEffect } from 'react'
import { Button } from '~/common/components/ui/button'
import { Input } from '~/common/components/ui/input'
import { Label } from '~/common/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/common/components/ui/card'
import { Alert, AlertDescription } from '~/common/components/ui/alert'
import { Badge } from '~/common/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '~/common/components/ui/radio-group'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/common/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '~/common/components/ui/popover'
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, Search, DollarSignIcon, UsersIcon, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useTransactionProvider } from '../../providers/TransactionProvider'
import { formatUnits } from 'viem'
import { searchAtomsByLabel } from '../../lib/atom-queue/atom-search-queries'
import { AtomIcon } from '~/components/AtomIcon'
import { toast } from '~/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { createTriples } from '@0xintuition/protocol'
import type { AtomMatch } from '../../lib/atom-queue/types'
import { CONFIG } from '~/constants/web3'
import { ToggleGroup, ToggleGroupItem } from '~/common/components/ui/toggle-group'
import { getSuggestedAtomsForPosition, type TripleSuggestion } from '../../lib/atom-queue/triple-suggestion-queries'
import { RecentAtomsService } from '../../lib/atom-queue/recent-atoms-service'

interface CreateTripleFlowProps {
  atomData: {
    termId: string
    label: string
    displayLabel?: string
  }
  onClose: () => void
}

type Position = 'subject' | 'predicate' | 'object'
type Step = 'position' | 'first-atom' | 'second-atom' | 'review' | 'creating' | 'success' | 'error'

interface TripleState {
  position: Position | null
  subject: AtomMatch | null
  predicate: AtomMatch | null
  object: AtomMatch | null
}


export function CreateTripleFlow({ atomData, onClose }: CreateTripleFlowProps) {
  const [step, setStep] = useState<Step>('position')
  const [triple, setTriple] = useState<TripleState>({
    position: null,
    subject: null,
    predicate: null,
    object: null
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAtom, setSelectedAtom] = useState<AtomMatch | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdTripleId, setCreatedTripleId] = useState<string | null>(null)
  const [balance, setBalance] = useState<bigint | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<bigint | null>(null)
  
  // Tab selection and suggestions
  const [resultsTab, setResultsTab] = useState<'match' | 'suggested'>('suggested')
  const [suggestions, setSuggestions] = useState<TripleSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  
  const queryClient = useQueryClient()
  const { contractConfig, publicClient, walletClient } = useTransactionProvider()

  // Search for atoms - always enabled when in atom selection steps
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['atom-search', searchQuery],
    queryFn: () => searchAtomsByLabel(searchQuery),
    enabled: searchQuery.length > 0 && (step === 'first-atom' || step === 'second-atom'),
    staleTime: 5 * 60 * 1000,
  })

  // Fetch balance and calculate cost
  useEffect(() => {
    const fetchBalanceAndCost = async () => {
      if (walletClient && publicClient && contractConfig) {
        const address = walletClient.account?.address
        if (address) {
          const bal = await publicClient.getBalance({ address })
          setBalance(bal)
          
          // Calculate triple cost
          const tripleCost = contractConfig.triple_cost ? BigInt(contractConfig.triple_cost) : BigInt(0)
          const minDeposit = contractConfig.min_deposit ? BigInt(contractConfig.min_deposit) : BigInt(0)
          const cost = tripleCost + minDeposit
          
          setEstimatedCost(cost)
        }
      }
    }
    
    if (step === 'review') {
      fetchBalanceAndCost()
    }
  }, [step, walletClient, publicClient, contractConfig])

  // Initialize the current atom in the selected position
  useEffect(() => {
    if (triple.position) {
      setTriple(prev => ({
        ...prev,
        [triple.position!]: {
          termId: atomData.termId,
          label: atomData.label,
          displayLabel: atomData.displayLabel || atomData.label,
          totalStaked: '0',
          totalPositions: 0
        }
      }))
      setStep('first-atom')
    }
  }, [triple.position, atomData])

  // Load suggestions when entering atom selection steps
  useEffect(() => {
    const loadSuggestions = async () => {
      if ((step === 'first-atom' || step === 'second-atom') && triple.position) {
        setLoadingSuggestions(true)
        setSuggestions([])
        
        try {
          // Determine target position based on what we need
          let targetPosition: Position
          if (step === 'first-atom') {
            // First selection after position choice
            if (triple.position === 'subject') {
              targetPosition = 'predicate' // Need a predicate
            } else if (triple.position === 'predicate') {
              targetPosition = 'subject' // Need a subject
            } else {
              targetPosition = 'subject' // Need a subject
            }
          } else {
            // Second selection - fill remaining position
            if (!triple.subject) {
              targetPosition = 'subject'
            } else if (!triple.predicate) {
              targetPosition = 'predicate'
            } else {
              targetPosition = 'object'
            }
          }
          
          console.log('[CreateTripleFlow] Loading suggestions for position:', targetPosition)
          
          const suggestionResults = await getSuggestedAtomsForPosition(
            atomData.termId,
            atomData.label,
            triple.position,
            targetPosition
          )
          
          setSuggestions(suggestionResults)
          
          // If no suggestions were found and we're looking for predicates, provide some defaults
          if (suggestionResults.length === 0 && targetPosition === 'predicate') {
            // Try searching for common predicates
            const predicateSearch = await searchAtomsByLabel('is')
            if (predicateSearch && predicateSearch.matches) {
              const fallbackSuggestions = predicateSearch.matches.slice(0, 5).map(match => ({
                atomId: match.termId,
                label: match.label,
                data: match.data || match.label,
                displayLabel: match.displayLabel || match.label,
                frequency: 0,
                totalStake: match.totalStaked
              }))
              setSuggestions(fallbackSuggestions)
            }
          }
        } catch (error) {
          console.error('[CreateTripleFlow] Error loading suggestions:', error)
          
          // Fallback: If suggestions fail for predicates, at least show some common options
          if (step === 'first-atom' && triple.position !== 'predicate') {
            setSuggestions([
              {
                atomId: CONFIG.IS_ATOM_ID,
                label: 'is',
                data: 'is',
                displayLabel: 'is',
                frequency: 0,
                totalStake: '0'
              },
              {
                atomId: CONFIG.OWNS_ATOM_ID,
                label: 'owns',
                data: 'owns', 
                displayLabel: 'owns',
                frequency: 0,
                totalStake: '0'
              },
              {
                atomId: CONFIG.HAS_NICKNAME_ATOM_ID,
                label: 'has-nickname',
                data: 'has-nickname',
                displayLabel: 'has nickname',
                frequency: 0,
                totalStake: '0'
              }
            ])
          }
        } finally {
          setLoadingSuggestions(false)
        }
      }
    }
    
    loadSuggestions()
  }, [step, triple.position, atomData])

  const handlePositionSelect = (position: Position) => {
    setTriple(prev => ({ ...prev, position }))
  }

  const handleAtomSelect = (atom: AtomMatch) => {
    if (step === 'first-atom') {
      // Determine which position to fill based on current atom position
      if (triple.position === 'subject') {
        setTriple(prev => ({ ...prev, predicate: atom }))
      } else if (triple.position === 'predicate') {
        setTriple(prev => ({ ...prev, subject: atom }))
      } else {
        setTriple(prev => ({ ...prev, subject: atom }))
      }
      setStep('second-atom')
      setSearchQuery('')
      setSelectedAtom(null)
    } else if (step === 'second-atom') {
      // Fill the remaining position
      if (!triple.subject) {
        setTriple(prev => ({ ...prev, subject: atom }))
      } else if (!triple.predicate) {
        setTriple(prev => ({ ...prev, predicate: atom }))
      } else {
        setTriple(prev => ({ ...prev, object: atom }))
      }
      setStep('review')
    }
  }

  const handleCreate = async () => {
    if (!triple.subject || !triple.predicate || !triple.object) {
      setError('Missing triple components')
      return
    }

    setStep('creating')
    setError(null)
    setIsCreating(true)

    try {
      // Check wallet balance
      if (balance && estimatedCost && balance < estimatedCost) {
        throw new Error(`Insufficient balance. You need ${formatUnits(estimatedCost, 18)} ETH but only have ${formatUnits(balance, 18)} ETH`)
      }

      if (!walletClient || !publicClient || !contractConfig) {
        throw new Error('Wallet not connected')
      }

      // Create the triple
      const config = {
        address: contractConfig.contract_address as `0x${string}`,
        abi: contractConfig.contract_abi,
        walletClient,
        publicClient,
      }

      const transactionHash = await createTriples(config, {
        args: [
          [triple.subject.termId], // subjectIds
          [triple.predicate.termId], // predicateIds
          [triple.object.termId], // objectIds
          [estimatedCost!], // assets
        ],
        value: estimatedCost!,
      })

      console.log('Triple creation transaction:', transactionHash)
      
      // Track atom usage for future suggestions
      await RecentAtomsService.trackAtomUsage({
        termId: triple.subject.termId,
        label: triple.subject.label,
        displayLabel: triple.subject.displayLabel
      })
      await RecentAtomsService.trackAtomUsage({
        termId: triple.predicate.termId,
        label: triple.predicate.label,
        displayLabel: triple.predicate.displayLabel
      })
      await RecentAtomsService.trackAtomUsage({
        termId: triple.object.termId,
        label: triple.object.label,
        displayLabel: triple.object.displayLabel
      })
      
      // TODO: Parse the event to get tripleId
      setCreatedTripleId(transactionHash)
      setStep('success')
      
      toast({
        title: "Triple Created!",
        description: "Your triple has been successfully created on-chain",
      })
      
    } catch (err: any) {
      console.error('[CreateTripleFlow] Error creating triple:', err)
      setError(err.message || 'Failed to create triple')
      setStep('error')
      
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to create triple',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'position':
        return 'Choose Position'
      case 'first-atom':
        return `Select ${triple.position === 'subject' ? 'Predicate' : 'Subject'}`
      case 'second-atom':
        return `Select ${!triple.object ? 'Object' : !triple.predicate ? 'Predicate' : 'Subject'}`
      case 'review':
        return 'Review Triple'
      case 'creating':
        return 'Creating Triple'
      case 'success':
        return 'Triple Created!'
      case 'error':
        return 'Error'
      default:
        return 'Create Triple'
    }
  }

  const formatStake = (stake: string) => {
    try {
      return Number(formatUnits(BigInt(stake), 18)).toFixed(2)
    } catch {
      return '0.00'
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>
            Create a triple relationship with "{atomData.displayLabel || atomData.label}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Position Selection */}
          {step === 'position' && (
            <div className="space-y-4">
              <RadioGroup value={triple.position || ''} onValueChange={(value) => handlePositionSelect(value as Position)}>
                <div className="space-y-3">
                  <Label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-muted transition-colors">
                    <RadioGroupItem value="subject" />
                    <div className="flex-1">
                      <p className="font-medium">Subject (Who/What)</p>
                      <p className="text-sm text-muted-foreground">This atom is the subject performing an action</p>
                    </div>
                  </Label>
                  
                  <Label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-muted transition-colors">
                    <RadioGroupItem value="predicate" />
                    <div className="flex-1">
                      <p className="font-medium">Predicate (Action/Relationship)</p>
                      <p className="text-sm text-muted-foreground">This atom describes the relationship</p>
                    </div>
                  </Label>
                  
                  <Label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-muted transition-colors">
                    <RadioGroupItem value="object" />
                    <div className="flex-1">
                      <p className="font-medium">Object (Target)</p>
                      <p className="text-sm text-muted-foreground">This atom is the target of the action</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => triple.position && setStep('first-atom')} 
                  disabled={!triple.position}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Atom Selection */}
          {(step === 'first-atom' || step === 'second-atom') && (
            <div className="space-y-4">
              {/* Triple Preview */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant={triple.subject ? 'default' : 'outline'}>
                      {triple.subject?.displayLabel || triple.subject?.label || '?'}
                    </Badge>
                    <ArrowRight className="h-4 w-4" />
                    <Badge variant={triple.predicate ? 'default' : 'outline'}>
                      {triple.predicate?.displayLabel || triple.predicate?.label || '?'}
                    </Badge>
                    <ArrowRight className="h-4 w-4" />
                    <Badge variant={triple.object ? 'default' : 'outline'}>
                      {triple.object?.displayLabel || triple.object?.label || '?'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Search Bar - Always Visible */}
              <div className="space-y-2">
                <Label>Search for atoms</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search for ${step === 'first-atom' ? (triple.position === 'subject' ? 'predicate' : 'subject') : 'object'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>

              {/* Results Tab Selection */}
              <div className="flex justify-center">
                <ToggleGroup 
                  type="single" 
                  value={resultsTab} 
                  onValueChange={(value) => value && setResultsTab(value as 'match' | 'suggested')}
                  className="border rounded-lg p-1 bg-muted/30"
                >
                  <ToggleGroupItem value="match" className="px-6 data-[state=on]:bg-background">
                    Best Match
                  </ToggleGroupItem>
                  <ToggleGroupItem value="suggested" className="px-6 data-[state=on]:bg-background">
                    Suggested
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Best Match Tab */}
              {resultsTab === 'match' && (
                <div className="space-y-2">
                  {searchQuery.length === 0 ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                      <p className="text-sm text-muted-foreground text-center">
                        Type to search for atoms by name...
                      </p>
                    </div>
                  ) : isSearching ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                      <div className="flex items-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                      </div>
                    </div>
                  ) : searchResults && searchResults.matches.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Ranked by name similarity
                      </p>
                      <div className="space-y-2 max-h-96 min-h-[300px] overflow-y-auto">
                        {searchResults.matches.map((match, index) => (
                          <div
                            key={match.termId}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => handleAtomSelect(match)}
                          >
                            <AtomIcon label={match.label} size={40} className="rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {match.displayLabel || match.label}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <DollarSignIcon className="h-3 w-3" />
                                  {formatStake(match.totalStaked)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <UsersIcon className="h-3 w-3" />
                                  {match.totalPositions}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="min-h-[300px] flex items-center justify-center">
                      <p className="text-sm text-muted-foreground text-center">
                        No atoms found matching "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Suggested Tab */}
              {resultsTab === 'suggested' && (
                <div className="space-y-2">
                  {loadingSuggestions ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                      <div className="flex items-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading suggestions...</span>
                      </div>
                    </div>
                  ) : (() => {
                    // Filter suggestions by search query if present
                    const filteredSuggestions = searchQuery.length > 0
                      ? suggestions.filter(s => 
                          (s.label?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (s.displayLabel?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                        )
                      : suggestions
                    
                    return filteredSuggestions.length > 0 ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery.length > 0 
                            ? `Smart suggestions matching "${searchQuery}"`
                            : 'Based on highest staked triples with similar patterns'
                          }
                        </p>
                        <div className="space-y-2 max-h-96 min-h-[280px] overflow-y-auto">
                          {filteredSuggestions.map((suggestion, index) => (
                            <div
                              key={suggestion.atomId}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                              onClick={() => handleAtomSelect({
                                termId: suggestion.atomId,
                                label: suggestion.label,
                                displayLabel: suggestion.displayLabel || suggestion.label,
                                totalStaked: suggestion.totalStake,
                                totalPositions: suggestion.frequency
                              } as AtomMatch)}
                            >
                              <AtomIcon label={suggestion.label} size={40} className="rounded-full flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {suggestion.displayLabel || suggestion.label}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <DollarSignIcon className="h-3 w-3" />
                                    {formatStake(suggestion.totalStake)}
                                  </span>
                                  <span>Used {suggestion.frequency}x</span>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="min-h-[300px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground text-center">
                          {searchQuery.length > 0 
                            ? `No suggestions found matching "${searchQuery}"`
                            : 'No suggestions available based on triple patterns'
                          }
                        </p>
                      </div>
                    )
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(step === 'first-atom' ? 'position' : 'first-atom')}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => {/* TODO: Implement create atom */}}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Atom
                </Button>
              </div>
            </div>
          )}

          {/* Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge>{triple.subject?.displayLabel || triple.subject?.label}</Badge>
                    <ArrowRight className="h-4 w-4" />
                    <Badge>{triple.predicate?.displayLabel || triple.predicate?.label}</Badge>
                    <ArrowRight className="h-4 w-4" />
                    <Badge>{triple.object?.displayLabel || triple.object?.label}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Cost:</span>
                      <span className="font-medium">
                        {estimatedCost ? formatUnits(estimatedCost, 18) : '0'} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Balance:</span>
                      <span className="font-medium">
                        {balance ? formatUnits(balance, 18) : '0'} ETH
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('second-atom')} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleCreate} className="flex-1">
                  Create Triple
                </Button>
              </div>
            </div>
          )}

          {/* Creating */}
          {step === 'creating' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Creating triple on-chain...</p>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium mb-2">Triple Created!</p>
                <p className="text-sm text-muted-foreground text-center">
                  Your triple has been successfully created on the blockchain.
                </p>
              </div>
              
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error || 'An unexpected error occurred'}</AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('review')} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}