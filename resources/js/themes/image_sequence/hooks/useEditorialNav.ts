import { useEffect } from 'react'

const SECTION_IDS = ['cover', 'editorial-sequence-container', 'editorial-event', 'editorial-rsvp']

export function useEditorialNav(
  activeSection: string,
  setActiveSection: React.Dispatch<React.SetStateAction<string>>
) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3
      let currentId = SECTION_IDS[0]

      SECTION_IDS.forEach((id) => {
        const sec = document.getElementById(id)
        if (sec && scrollPos >= sec.offsetTop) {
          currentId = id
        }
      })

      setActiveSection(currentId)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [setActiveSection])
}
