import * as React from 'react'

export interface GalleryData {
  id: string
  image_url: string
  caption?: string
}

interface GalleryProps {
  galleries: GalleryData[]
}

export function Gallery({ galleries }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)

  if (!galleries || galleries.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleries.length)
    }
  }

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleries.length) % galleries.length)
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex])

  return (
    <>
      <section id="gallery" className="section-padding bg-surface-variant text-center">
        <div className="heritage-divider-gold" />

        <div className="section-title mb-6">
          <h2 className="font-cursive text-gold">Galeri</h2>
          <p className="section-subtitle">Gallery</p>
        </div>

        <div className="gallery-grid">
          {galleries.map((gallery, index) => (
            <div
              key={gallery.id}
              className="gallery-item"
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={gallery.image_url}
                  alt={gallery.caption || `Gallery ${index + 1}`}
                  className="gallery-image"
                  loading="lazy"
                />
                <div className="gallery-overlay">
                  <span>🔍</span>
                  {gallery.caption && <p className="gallery-caption">{gallery.caption}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div
        className={`lightbox-overlay ${lightboxIndex !== null ? 'active' : ''}`}
        onClick={closeLightbox}
      >
        {lightboxIndex !== null && (
          <>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img
                src={galleries[lightboxIndex].image_url}
                alt={galleries[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
              />
              {galleries[lightboxIndex].caption && (
                <p id="lightbox-caption" className="text-gold mt-4">
                  {galleries[lightboxIndex].caption}
                </p>
              )}
            </div>
            <div className="lightbox-close" onClick={closeLightbox} role="button">
              ×
            </div>
            <div className="lightbox-prev" onClick={(e) => { e.stopPropagation(); goPrev() }}>
              ‹
            </div>
            <div className="lightbox-next" onClick={(e) => { e.stopPropagation(); goNext() }}>
              ›
            </div>
          </>
        )}
      </div>
    </>
  )
}
