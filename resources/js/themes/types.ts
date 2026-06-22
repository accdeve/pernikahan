// Base invitation data (from DB, snake_case)
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
  style?: string
}

export interface BaseCoverProps {
  groomName: string
  brideName: string
  weddingDate: string
  guestName?: string
  onOpen: () => void
}

export interface BaseCoupleProps {
  groomName: string
  groomNickname?: string
  groomFather?: string
  groomMother?: string
  brideName: string
  brideNickname?: string
  brideFather?: string
  brideMother?: string
}

export interface BaseEventDetails {
  name: string
  date: string
  time: string
  location: string
  address: string
  mapUrl?: string
}

export interface BaseEventProps {
  events: BaseEventDetails[]
  countdownTarget?: string
}

export interface BaseStoryData {
  id: string
  title: string
  date: string
  description?: string
  image_url?: string
}

export interface BaseGalleryData {
  id: string
  image_url: string
  caption?: string
}

export interface BaseGuestData {
  id: string
  name: string
  attendance?: 'hadir' | 'tidak' | null
  message?: string
  created_at: string
}

export interface BaseRsvpProps {
  invitationId: string
  guests: BaseGuestData[]
  onRefreshGuests: () => void
}

export interface BaseGiftAccount {
  type: 'bank' | 'wallet'
  name: string
  accountNumber: string
  holder: string
}

export interface BaseClosingProps {
  groomName: string
  brideName: string
  bankAccounts: BaseGiftAccount[]
  walletAccounts: BaseGiftAccount[]
}

export interface BaseNavProps {
  activeSection: string
  onNavigate: (sectionId: string) => void
}

export interface ThemeProps {
  invitation: InvitationData
  stories: BaseStoryData[]
  galleries: BaseGalleryData[]
  guests: BaseGuestData[]
  onRefreshGuests: () => void
}
