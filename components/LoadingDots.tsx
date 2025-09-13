interface LoadingDotsProps {
  transitionDuration?: number
  isVisible?: boolean
}

export default function LoadingDots({
  transitionDuration = 300,
  isVisible = true,
}: LoadingDotsProps) {
  return (
    <div
      className="flex gap-1 justify-center items-center"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${transitionDuration}ms ease-in-out`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-600 rounded-full"
          style={{
            animation: 'wave 1.2s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  )
}
