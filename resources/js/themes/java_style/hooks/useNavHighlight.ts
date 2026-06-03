import { useEffect } from 'react'

interface NavButton {
  href: string
  onClick?: (e: MouseEvent) => void
}

export function useNavHighlight(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  navButtons: NavButton[]
) {
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || navButtons.length === 0) return

    const sections = scrollContainer.querySelectorAll('section')

    const handleNavClick = (btn: NavButton, e: Event) => {
      e.preventDefault()
      const target = scrollContainer.querySelector(btn.href)
      if (target) {
        navButtons.forEach((b) => {
          const el = scrollContainer.querySelector(b.href)
          el?.classList.remove('active')
        })
        target.classList.add('active')
        scrollContainer.scrollTo({ top: target.getBoundingClientRect().top + scrollContainer.scrollTop, behavior: 'smooth' })
      }
    }

    const clickHandlers: Array<() => void> = []

    navButtons.forEach((btn) => {
      const el = scrollContainer.querySelector(btn.href)
      if (el) {
        const handler = (e: Event) => handleNavClick(btn, e)
        el.addEventListener('click', handler)
        clickHandlers.push(() => el.removeEventListener('click', handler))
      }
    })

    const handleScroll = () => {
      const scrollPos = scrollContainer.scrollTop + 120
      let currentId = 'couple'

      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollPos) {
          currentId = sec.id
        }
      })

      navButtons.forEach((btn) => {
        const el = scrollContainer.querySelector(btn.href)
        if (el) {
          el.classList.toggle('active', btn.href === `#${currentId}`)
        }
      })
    }

    scrollContainer.addEventListener('scroll', handleScroll)

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      clickHandlers.forEach((cleanup) => cleanup())
    }
  }, [scrollContainerRef, navButtons])
}
