import * as React from 'react'
import { Cover } from './Cover'
import { Couple } from './Couple'
import { Event } from './Event'
import { Story, type StoryData } from './Story'
import { Gallery, type GalleryData } from './Gallery'
import { Rsvp, type GuestData } from './Rsvp'
import { Closing } from './Closing'
import { Nav } from './Nav'

export interface InvitationData {
  id: string
  groom_name: string
  groom_nickname?: string
  groom_father?: string
  groom_mother?: string
  bride_name: string
  bride_nickname?: string
  bride_father?: string
  bride_mother?: string
  wedding_date: string
  akad_date?: string
  akad_time?: string
  akad_location?: string
  akad_address?: string
  akad_map_url?: string
  resepsi_date?: string
  resepsi_time?: string
  resepsi_location?: string
  resepsi_address?: string
  resepsi_map_url?: string
  bank_name?: string
  bank_account_number?: string
  bank_account_holder?: string
  wallet_name?: string
  wallet_number?: string
  wallet_holder?: string
  audio_url?: string
  guest_name?: string
}

interface JavaStyleThemeProps {
  invitation: InvitationData
  stories: StoryData[]
  galleries: GalleryData[]
  guests: GuestData[]
  onRefreshGuests: () => void
}

export function JavaStyleTheme({
  invitation,
  stories,
  galleries,
  guests,
  onRefreshGuests,
}: JavaStyleThemeProps) {
  const [isOpened, setIsOpened] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState('couple')
  const contentRef = React.useRef<HTMLDivElement>(null)

  const handleOpen = () => {
    setIsOpened(true)
  }

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element && contentRef.current) {
      contentRef.current.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' })
    }
  }

  React.useEffect(() => {
    if (!isOpened) return

    const content = contentRef.current
    if (!content) return

    const handleScroll = () => {
      const scrollPos = content.scrollTop + 120
      const sections = ['couple', 'event', 'story', 'gallery', 'rsvp', 'closing']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id)
          break
        }
      }
    }

    content.addEventListener('scroll', handleScroll)
    return () => content.removeEventListener('scroll', handleScroll)
  }, [isOpened])

  const formatWeddingDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const events = []
  if (invitation.akad_date) {
    events.push({
      name: 'Akad Nikah',
      date: formatWeddingDate(invitation.akad_date),
      time: invitation.akad_time || '',
      location: invitation.akad_location || '',
      address: invitation.akad_address || '',
      mapUrl: invitation.akad_map_url,
    })
  }
  if (invitation.resepsi_date) {
    events.push({
      name: 'Resepsi',
      date: formatWeddingDate(invitation.resepsi_date),
      time: invitation.resepsi_time || '',
      location: invitation.resepsi_location || '',
      address: invitation.resepsi_address || '',
      mapUrl: invitation.resepsi_map_url,
    })
  }

  const bankAccounts = invitation.bank_account_number
    ? [
        {
          type: 'bank' as const,
          name: invitation.bank_name || 'Transfer Bank',
          accountNumber: invitation.bank_account_number,
          holder: invitation.bank_account_holder || '',
        },
      ]
    : []

  const walletAccounts = invitation.wallet_number
    ? [
        {
          type: 'wallet' as const,
          name: invitation.wallet_name || 'E-Wallet',
          accountNumber: invitation.wallet_number,
          holder: invitation.wallet_holder || '',
        },
      ]
    : []

  return (
    <div className="app-container">
      <div className="invitation-wrapper">
        {!isOpened && (
          <Cover
            groomName={invitation.groom_name}
            brideName={invitation.bride_name}
            weddingDate={formatWeddingDate(invitation.wedding_date)}
            guestName={invitation.guest_name}
            onOpen={handleOpen}
          />
        )}

        <div
          ref={contentRef}
          id="invitation-main-content"
          className={`invitation-content ${isOpened ? '' : 'hidden'}`}
        >
          <Couple
            groomName={invitation.groom_name}
            groomNickname={invitation.groom_nickname}
            groomFather={invitation.groom_father}
            groomMother={invitation.groom_mother}
            brideName={invitation.bride_name}
            brideNickname={invitation.bride_nickname}
            brideFather={invitation.bride_father}
            brideMother={invitation.bride_mother}
          />

          <Event events={events} countdownTarget={invitation.wedding_date} />

          <Story stories={stories} />

          <Gallery galleries={galleries} />

          <Rsvp
            invitationId={invitation.id}
            guests={guests}
            onRefreshGuests={onRefreshGuests}
          />

          <Closing
            groomName={invitation.groom_name}
            brideName={invitation.bride_name}
            bankAccounts={bankAccounts}
            walletAccounts={walletAccounts}
          />
        </div>

        {isOpened && <Nav activeSection={activeSection} onNavigate={handleNavigate} />}
      </div>
    </div>
  )
}
