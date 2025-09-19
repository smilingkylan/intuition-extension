import { Spinner } from './ui/spinner'

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function LoadingDots({
  size = 'medium',
  className = ''
}: LoadingDotsProps) {
  const sizeMap = {
    small: 'sm',
    medium: 'default', 
    large: 'lg'
  } as const

  return (
    <Spinner 
      size={sizeMap[size]} 
      className={className}
    />
  )
}
