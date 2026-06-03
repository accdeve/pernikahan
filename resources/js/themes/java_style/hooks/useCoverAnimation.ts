import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface UseCoverAnimationOptions {
  isOpen: boolean
  onOpen?: () => void
}

export function useCoverAnimation(
  coverRef: React.RefObject<HTMLDivElement | null>,
  options: UseCoverAnimationOptions
) {
  const { isOpen, onOpen } = options
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!coverRef.current) return

    const cover = coverRef.current
    const coverNames = cover.querySelector('.cover-names')
    const coverDate = cover.querySelector('.cover-date')
    const guestCard = cover.querySelector('.guest-card')
    const javaneseLabel = cover.querySelector('.javanese-label')
    const btnOpen = cover.querySelector('#btn-open-invitation')

    const tl = gsap.timeline()

    if (coverNames) {
      tl.fromTo(
        coverNames,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', delay: 0.3 }
      )
    }
    if (javaneseLabel) {
      tl.fromTo(
        javaneseLabel,
        { opacity: 0, y: -10 },
        { opacity: 0.8, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.6 }
      )
    }
    if (coverDate) {
      tl.fromTo(
        coverDate,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.8 }
      )
    }
    if (guestCard) {
      tl.fromTo(
        guestCard,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.2 }
      )
    }
    if (btnOpen) {
      tl.fromTo(
        btnOpen,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.75)', delay: 1.5 }
      )
    }

    timelineRef.current = tl

    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !coverRef.current) return

    const mainContent = document.getElementById('invitation-main-content')
    const bottomControls = document.getElementById('invitation-bottom-controls')

    const tl = gsap.timeline()

    tl.to(coverRef.current, {
      yPercent: -100,
      opacity: 0,
      duration: 1.6,
      ease: 'power4.inOut',
      onComplete: () => {
        if (coverRef.current) {
          coverRef.current.style.display = 'none'
        }
        if (mainContent) {
          mainContent.classList.remove('hidden')
          gsap.fromTo(
            mainContent,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 }
          )
        }
        if (bottomControls) {
          bottomControls.classList.remove('hidden')
          gsap.fromTo(
            bottomControls,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.8 }
          )
        }
        onOpen?.()
      },
    })

    return () => {
      tl.kill()
    }
  }, [isOpen, onOpen])
}
