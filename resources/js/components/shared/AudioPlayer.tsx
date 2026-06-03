import * as React from 'react'
import { Music, Pause } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)

  React.useEffect(() => {
    const audio = new Audio(audioUrl)
    audio.loop = true
    audioRef.current = audio

    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (audioRef.current.paused) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }

  return (
    <button
      onClick={togglePlay}
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#d4af37] shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
    >
      {isPlaying ? (
        <Pause className="h-5 w-5 text-white" />
      ) : (
        <Music className="h-5 w-5 text-white" />
      )}
    </button>
  )
}
