import { useState } from 'react'
import { strengthenImageUrl } from '../util'

export const UnknownImage = ({
  asLink = false,
  src,
  ...props
}: {
  src: string
  asLink?: boolean
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [numberOfErrors, setNumberOfErrors] = useState(0)

  const onImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    finalSrc: string
  ) => {
    setNumberOfErrors(numberOfErrors + 1)
    console.log('onImageError', e.currentTarget.src, finalSrc)
  }

  const finalSrc = strengthenImageUrl(src)

  return (
    <img src={finalSrc} onError={(e) => onImageError(e, finalSrc)} {...props} />
  )
}

export default UnknownImage
