import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(scrollContainerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const fadeUps = scrollContainer.querySelectorAll('.fade-up')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated')
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 35 },
              { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
            )
          }
        })
      },
      {
        root: scrollContainer,
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    fadeUps.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [scrollContainerRef])
}
