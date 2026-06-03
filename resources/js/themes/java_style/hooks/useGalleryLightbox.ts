import { useState, useCallback } from 'react'

export interface GalleryPhoto {
  src: string
  caption: string
}

interface UseGalleryLightboxOptions {
  photos: GalleryPhoto[]
}

export function useGalleryLightbox({ photos }: UseGalleryLightboxOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const open = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      setIsOpen(true)
    },
    []
  )

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }, [photos.length])

  return {
    isOpen,
    currentIndex,
    currentPhoto: photos[currentIndex],
    open,
    close,
    prev,
    next,
    hasMultiple: photos.length > 1,
  }
}
