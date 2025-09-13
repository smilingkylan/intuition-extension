import { toSvg } from 'jdenticon'
import { useState } from 'react'

import { getFixedXProfileImageUrl } from '../util/syntax'
import { cn } from '../util/util'

const AtomAvatar = ({ atom, imageAtom, ...props }) => {
  const [isError, setIsError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const src = atom.atomIpfsData?.contents?.image

  const onImageError = () => {
    console.log('onImageError')
    setIsError(true)
  }

  const onImageLoad = () => {
    console.log('onImageLoad')
    setIsLoaded(true)
  }

  const fixedImageUrl = getFixedXProfileImageUrl(src)

  console.log('src', src)

  return (
    <div {...props}>
      <svg
        data-jdenticon-value={toSvg(atom.id, 14)}
        className={cn(isLoaded && !isError && 'hidden')}
      />
      <img
        onLoad={onImageLoad}
        src={fixedImageUrl || src}
        alt={props.alt}
        onError={onImageError}
        className={cn(isError && 'hidden')}
      />
    </div>
  )
}

export default AtomAvatar
