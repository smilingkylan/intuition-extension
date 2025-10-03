const profileImagePatterns = [
  '_normal.',
  '_bigger.',
  '_mini.',
]

export const fixImageUrl = (url: string): string => {
  if (!url) throw new Error('Invalid X.com image URL')
  const pattern = profileImagePatterns.find((pattern) => url.includes(pattern))
  if (!pattern) return url
  const splitUrl: string[] = url.split(pattern)
  const fixedUrl =
    splitUrl.slice(0, -1).join('') + '_400x400.' + splitUrl.slice(-1)[0]
  return fixedUrl
}
