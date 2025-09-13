import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel'
import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
// Removed cryptoToFiat import - using unified converter now
import { Link } from '@tanstack/react-router'
import { useCurrencyConverter } from '../../hooks/use-currency-converter'

type ImageAtomCarouselProps = {
  imageTriples: any[]
  position: number // 0 for subject, 1 for predicate, 2 for object
  exchangeRate?: any
}

const positionMap = {
  0: 'subject',
  1: 'predicate',
  2: 'object',
}

export const ImageAtomCarousel = ({
  imageTriples,
  position,
}: ImageAtomCarouselProps) => {
  return (
    <Carousel>
      <CarouselContent>
        {imageTriples.map((imageTriple, index) => (
          <ImageAtomCarouselItem
            key={index}
            triple={imageTriple}
            position={position}
          />
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

export const ImageAtomCarouselItem = ({
  triple,
  position,
}: {
  triple: any
  position: number
}) => {
  const { converter } = useCurrencyConverter('trust')
  const positionKey = positionMap[position]
  const atom = triple[positionKey]

  let fiatValue = ''
  if (triple.triple_vault?.market_cap && converter) {
    const result = converter.convertMarketCap(triple.triple_vault.market_cap)
    fiatValue = result.fiat.formatted
  }

  return (
    <CarouselItem className="relative">
      <a
        href={atom.image}
        target="_blank"
        rel="noopener,noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors group z-10"
        title="Open image in new tab"
      >
        <ExternalLinkIcon
          size={14}
          className="text-white opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </a>
      <Link to={`/triples/$tripleId`} params={{ tripleId: triple.term_id }}>
        <img
          src={atom.image}
          alt={atom.label}
          className="w-full h-full object-cover rounded-lg"
        />

        {fiatValue && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0 bg-black/60 hover:bg-black/80 rounded-md backdrop-blur-sm z-10 transition-colors">
            <span className="text-white text-[10px] font-semibold drop-shadow-sm">
              {fiatValue}
            </span>
          </div>
        )}
      </Link>
    </CarouselItem>
  )
}