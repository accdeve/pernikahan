import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useCoverSequence(
  coverRef: React.RefObject<HTMLDivElement | null>
) {
  const tweensRef = useRef<gsap.core.Tween[]>([])

  useEffect(() => {
    const cover = coverRef.current
    if (!cover) return

    const coverTitle = cover.querySelector('.cover-title')
    const coverSubtitle = cover.querySelector('.cover-subtitle')
    const coverDate = cover.querySelector('.cover-date')
    const guestCardEditorial = cover.querySelector('.guest-card-editorial')
    const btnOpen = cover.querySelector('#btn-open-invitation')

    const tweens: gsap.core.Tween[] = []

    if (coverSubtitle) {
      tweens.push(
        gsap.fromTo(
          coverSubtitle,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.3 }
        )
      )
    }
    if (coverTitle) {
      tweens.push(
        gsap.fromTo(
          coverTitle,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', delay: 0.6 }
        )
      )
    }
    if (coverDate) {
      tweens.push(
        gsap.fromTo(
          coverDate,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.0 }
        )
      )
    }
    if (guestCardEditorial) {
      tweens.push(
        gsap.fromTo(
          guestCardEditorial,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.3 }
        )
      )
    }
    if (btnOpen) {
      tweens.push(
        gsap.fromTo(
          btnOpen,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.6 }
        )
      )
    }

    tweensRef.current = tweens

    return () => {
      tweensRef.current.forEach((tween) => tween.kill())
      tweensRef.current = []
    }
  }, [coverRef])
}
