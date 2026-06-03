import * as React from 'react'
import { Nav } from './Nav'
import { Cover } from './Cover'
import { Couple } from './Couple'
import { Event } from './Event'
import { Rsvp } from './Rsvp'
import { Closing } from './Closing'

export interface InvitationData {
  id: string
  customerId: string
  groomName: string
  brideName: string
  groomParent?: string
  brideParent?: string
  weddingDate: string
  events: Array<{
    title: string
    date: string
    time: string
    location: string
    mapUrl?: string
  }>
  giftAccounts?: Array<{
    bank: string
    accountNumber: string
    accountName: string
  }>
  audioUrl?: string
  style?: string
}

export interface GuestData {
  id: string
  name: string
  attendance: boolean
  comment?: string
  createdAt: string
}

interface ImageSequenceThemeProps {
  invitation: InvitationData
  guests: GuestData[]
  onRefreshGuests: () => void
}

export function ImageSequenceTheme({ invitation, guests, onRefreshGuests }: ImageSequenceThemeProps) {
  const [isOpened, setIsOpened] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState('cover')

  React.useEffect(() => {
    if (!isOpened) return

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3
      const sectionIds = ['cover', 'editorial-sequence-container', 'editorial-event', 'editorial-rsvp']
      let current = sectionIds[0]

      sectionIds.forEach((id) => {
        const el = document.getElementById(id)
        if (el && scrollPos >= el.offsetTop) {
          current = id
        }
      })

      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpened])

  const handleOpen = () => {
    setIsOpened(true)
  }

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="theme-image_sequence">
      <Nav activeSection={activeSection} onNavClick={handleNavClick} />

      <Cover
        groomName={invitation.groomName}
        brideName={invitation.brideName}
        weddingDate={invitation.weddingDate}
        onOpen={handleOpen}
      />

      {isOpened && (
        <main id="invitation-main-content">
          <Couple
            groomName={invitation.groomName}
            groomParent={invitation.groomParent || ''}
            brideName={invitation.brideName}
            brideParent={invitation.brideParent || ''}
          />

          <Event events={invitation.events} />

          <Rsvp
            customerId={invitation.customerId}
            onGuestAdded={onRefreshGuests}
          />

          <Closing
            groomName={invitation.groomName}
            brideName={invitation.brideName}
            giftAccounts={invitation.giftAccounts}
          />
        </main>
      )}

      {invitation.audioUrl && isOpened && (
        <audio id="bg-music" src={invitation.audioUrl} loop />
      )}
    </div>
  )
}
