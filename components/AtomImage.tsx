import { useState } from 'react'
import { CONFIG } from '~/constants/web3'
import type { AtomWithContents } from '../types/intuition'

const { REVEL8_EXPLORER_ORIGIN } = CONFIG

// SVG with transparent background
const ATOM_SVG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtYXRvbSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMSIvPjxwYXRoIGQ9Ik0yMC4yIDIwLjJjMi4wNC0yLjAzLjAyLTcuMzYtNC41LTExLjktNC41NC00LjUyLTkuODctNi41NC0xMS45LTQuNS0yLjA0IDIuMDMtLjAyIDcuMzYgNC41IDExLjkgNC41NCA0LjUyIDkuODcgNi41NCAxMS45IDQuNVoiLz48cGF0aCBkPSJNMTUuNyAxNS43YzQuNTItNC41NCA2LjU0LTkuODcgNC41LTExLjktMi4wMy0yLjA0LTcuMzYtLjAyLTExLjkgNC41LTQuNTIgNC41NC02LjU0IDkuODctNC41IDExLjkgMi4wMyAyLjA0IDcuMzYuMDIgMTEuOS00LjVaIi8+PC9zdmc+'

export const AtomImage = ({
  asLink = false,
  atom,
  ...props
}: {
  asLink?: boolean
  atom: AtomWithContents
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [numberOfErrors, setNumberOfErrors] = useState(0)

  const onImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    src: string,
    atom: AtomWithContents
  ) => {
    setNumberOfErrors(numberOfErrors + 1)
    console.log('onImageError', e.currentTarget.src, src, atom)
  }

  const { id, atomIpfsData, contents: atomContents } = atom
  const contents = atomContents || atomIpfsData?.contents || {}
  const image_filename = contents?.image

  let src = image_filename
  const contentsImage = atom.atomIpfsData?.image
  if (contentsImage) {
    src = strengthenImageUrl(contentsImage)
  }
  let opacity = 1
  if (numberOfErrors > 1 || !src) {
    src = ATOM_SVG
    opacity = 0.1
  }

  const image = (
    <img
      src={src}
      alt={contents?.name}
      onError={(e) => onImageError(e, src, atom)}
      style={{ opacity }}
      {...props}
    />
  )

  if (asLink) {
    const linkUrl = `${REVEL8_EXPLORER_ORIGIN}/atoms/${id}`
    return (
      <a href={linkUrl} title={contents?.name} target="_blank">
        {image}
      </a>
    )
  }

  return image
}
