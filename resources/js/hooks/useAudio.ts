import { useState, useRef, useEffect } from 'react'

interface UseAudioOptions {
  url?: string
  autoPlay?: boolean
  loop?: boolean
}

export function useAudio({ url, autoPlay = false, loop = true }: UseAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!url) return
    const audio = new Audio(url)
    audio.loop = loop
    audio.preload = 'auto'
    audioRef.current = audio

    audio.addEventListener('canplaythrough', () => setIsLoaded(true))
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('ended', () => setIsPlaying(false))

    if (autoPlay) {
      audio.play().catch(() => {}) // may be blocked by browser autoplay policy
    }

    return () => {
      audio.pause()
      audio.src = ''
      audio.load() // actually unload
      audioRef.current = null
    }
  }, [url, loop, autoPlay])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.warn)
    } else {
      audioRef.current.pause()
    }
  }

  const play = () => audioRef.current?.play().catch(console.warn)
  const pause = () => audioRef.current?.pause()

  return { isPlaying, isLoaded, togglePlay, play, pause }
}
