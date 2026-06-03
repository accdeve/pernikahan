import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollSequence(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const triggerRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const slides = container.querySelectorAll('.sequence-slide')
    const texts = container.querySelectorAll('.sequence-text')
    const totalFrames = slides.length
    if (totalFrames <= 1) return

    // Activate first slide immediately
    slides[0]?.classList.add('active')
    texts[0]?.classList.add('active')

    triggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${window.innerHeight * totalFrames}`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const activeIndex = Math.min(
          Math.round(self.progress * (totalFrames - 1)),
          totalFrames - 1
        )
        slides.forEach((slide, i) => slide.classList.toggle('active', i === activeIndex))
        texts.forEach((text, i) => text.classList.toggle('active', i === activeIndex))
      },
    })

    return () => {
      triggerRef.current?.kill()
      triggerRef.current = null
    }
  }, [containerRef])
}
