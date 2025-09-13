import { Button } from '~/components/ui/button'
import Img from '~/components/UnknownImage'
import { SCHEMA_TYPE_ICONS, CONFIG } from '~/constants'
// import { fetchAtomImages } from '~/util/fetch'
import { PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '~/components/ui/card'
import { getAtomContents, shortenLabel } from '../util'

const getIcon = (type: string) => {
  let icon = null
  switch (type) {
    case 'Person':
      icon = <SCHEMA_TYPE_ICONS.person className="inline h-5" />
      break
    case 'Organization':
      icon = <SCHEMA_TYPE_ICONS.organization className="inline h-5" />
      break
    case 'Event':
      icon = <SCHEMA_TYPE_ICONS.event className="inline h-5" />
      break
  }
  return icon
}

export const AtomSummary = ({
  atomData,
  isEditable = false,
  nickname = null,
  addImage,
  images,
}: {
  atomData: any
  isEditable: boolean
  nickname?: string | null
  addImage?: () => void
  images?: { url: string }[]
}) => {
  const { REVEL8_EXPLORER_DOMAIN } = CONFIG
  // is this enough? what if focus changes?

  const type = atomData['@type']
  let icon = getIcon(type)

  const mostRelevantImage = images?.[0]

  const atomUrl = `${REVEL8_EXPLORER_DOMAIN}/atoms/${atomData.term_id}`

  const onClickAddImage = () => {
    addImage && addImage()
  }

  const contents = getAtomContents(atomData)

  return (
    <div
      key={atomData.id}
      className="flex flex-col max-h-[90px] overflow-y-hidden text-ellipsis"
    >
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-col justify-between">
          <div className="">
            <h3 className={'text-sm font-bold text-left mb-0'}>
              {icon}
              <a href={atomUrl} target="_blank" rel="noopener noreferrer">
                {shortenLabel(atomData.label)}
              </a>
            </h3>
            {!!nickname && (
              <span className="text-xs text-muted-foreground">{nickname}</span>
            )}
          </div>
          <p className="ellipsis max-h-36 text-xs">{contents?.description}</p>
        </div>
        {mostRelevantImage?.url ? (
          <a
            href={atomUrl}
            title={`Revel8 explorer link for ${atomData.label} atom`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[72px] h-[72px] overflow-hidden"
          >
            <Img
              src={mostRelevantImage?.url}
              className="object-cover rounded-sm"
            />
          </a>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={onClickAddImage}
            className="w-[72px] h-[72px] flex-shrink-0"
          >
            <PlusIcon className="w-8 h-8" /> {/* Adjusted icon size */}
          </Button>
        )}
      </div>
    </div>
  )
}

type AtomSummaryCardProps = {
  atomData: any
  getAtomTriples?: () => void
  isEditable: boolean
  atomOverwrite?: any
}

export const AtomSummaryCard = (props: AtomSummaryCardProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="p-2">
        <AtomSummary {...props} />
      </CardContent>
    </Card>
  )
}

export const FetchedAtomSummaryCard = (props: AtomSummaryCardProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="p-2">
        <FetchedAtomSummary {...props} />
      </CardContent>
    </Card>
  )
}

export const FetchedAtomSummary = ({
  atomData,
  imageUrl,
  isEditable = false,
  nickname = null,
  addImage,
  onAddImageSuccess,
}: {
  atomData: any
  imageUrl?: string
  isEditable: boolean
  nickname?: string | null
  addImage?: () => void
  onAddImageSuccess?: () => void
}) => {
  const [mostRelevantImages, setMostRelevantImages] = useState([])

  const getMostRelevantImages = async () => {
    try {
      const images = [] // await fetchAtomImages(atomData.term_id)
      setMostRelevantImages(images)
    } catch (err) {
      console.error('fetchAtomImages error', err)
      toast.error('Failed to fetch atom images')
    }
  }

  const onAddRelatedImageSuccess = async () => {
    getMostRelevantImages()
    onAddImageSuccess && onAddImageSuccess()
  }

  useEffect(() => {
    if (!imageUrl) getMostRelevantImages()
  }, [atomData.id])

  return (
    <AtomSummary
      atomData={atomData}
      images={mostRelevantImages}
      isEditable={isEditable}
      nickname={nickname}
      addImage={addImage}
    />
  )
}
