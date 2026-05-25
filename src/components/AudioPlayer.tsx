'use client'

import { useEffect, useRef, useState } from 'react'

interface AudioPlayerProps {
  url: string
  autoPlayTrigger?: boolean
}

export default function AudioPlayer({ url, autoPlayTrigger = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && autoPlayTrigger && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('[AudioPlayer] Play blocked by browser autocomplete/interaction policy:', err))
    }
  }, [autoPlayTrigger, mounted])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('[AudioPlayer] Play blocked:', err))
    }
  }

  if (!mounted) return null

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="auto" />
      
      {/* Floating Audio Control Button */}
      <button
        id="floating-audio-control"
        className={`floating-audio-btn ${isPlaying ? 'rotating' : ''}`}
        onClick={togglePlay}
        aria-label="Toggle background music"
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          zIndex: 999,
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          backgroundColor: 'rgba(22, 19, 11, 0.75)',
          border: '1px solid rgba(242, 202, 80, 0.3)',
          color: '#f2ca50',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          {isPlaying ? 'music_note' : 'music_off'}
        </span>
      </button>
    </>
  )
}
