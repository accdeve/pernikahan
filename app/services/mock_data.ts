import { DateTime } from 'luxon'

export interface MockStory {
  id: number
  invitationId: number
  milestoneDate: string
  title: string
  description: string
  imageUrl: string
  sortOrder: number
}

export interface MockGallery {
  id: number
  invitationId: number
  imageUrl: string
  caption: string
  sortOrder: number
}

export interface MockGuest {
  id: number
  invitationId: number
  name: string
  attendance: string
  comment: string
  createdAt?: DateTime
}

export interface MockInvitation {
  id: number
  slug: string
  brideName: string
  brideNickname: string
  brideParentFather: string
  brideParentMother: string
  groomName: string
  groomNickname: string
  groomParentFather: string
  groomParentMother: string
  akadDatetime: DateTime
  resepsiDatetime: DateTime
  eventLocation: string
  eventAddress: string
  googleMapsUrl: string
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  walletName: string
  walletNumber: string
  walletHolder: string
  bgMusicUrl: string
  style: string
  stories: MockStory[]
  galleries: MockGallery[]
  guests: MockGuest[]
}

const mockStories = (invitationId: number): MockStory[] => [
  {
    id: 1,
    invitationId,
    milestoneDate: 'SEPTEMBER 2021',
    title: 'Awal Berjumpa',
    description: 'Pertemuan tak terduga yang menjadi awal dari segalanya. Di bawah langit senja, semesta mempertemukan dua jiwa yang mencari.',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
    sortOrder: 1,
  },
  {
    id: 2,
    invitationId,
    milestoneDate: 'JULI 2023',
    title: 'Lamaran',
    description: 'Satu janji terucap di hadapan keluarga tercinta. Sebuah komitmen untuk melangkah bersama mengarungi samudera kehidupan.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
    sortOrder: 2,
  },
  {
    id: 3,
    invitationId,
    milestoneDate: 'MEI 2026',
    title: 'Menuju Halal',
    description: 'Menanti hari kemenangan, menyatukan doa dan harapan untuk menjadi satu dalam ikatan yang suci dan diridhai Allah SWT.',
    imageUrl: 'https://images.unsplash.com/photo-1494972308805-463bc619b34e?q=80&w=600&auto=format&fit=crop',
    sortOrder: 3,
  },
]

const mockGalleries = (invitationId: number): MockGallery[] => [
  {
    id: 1,
    invitationId,
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop',
    caption: 'Batik Keagungan',
    sortOrder: 1,
  },
  {
    id: 2,
    invitationId,
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop',
    caption: 'Sentuhan Kasih',
    sortOrder: 2,
  },
  {
    id: 3,
    invitationId,
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop',
    caption: 'Langkah Bersama',
    sortOrder: 3,
  },
  {
    id: 4,
    invitationId,
    imageUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600&auto=format&fit=crop',
    caption: 'Wibawa Beskap',
    sortOrder: 4,
  },
  {
    id: 5,
    invitationId,
    imageUrl: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600&auto=format&fit=crop',
    caption: 'Taman Bunga Senja',
    sortOrder: 5,
  },
  {
    id: 6,
    invitationId,
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600&auto=format&fit=crop',
    caption: 'Ikatan Suci',
    sortOrder: 6,
  },
]

const mockGuests = (invitationId: number): MockGuest[] => [
  {
    id: 1,
    invitationId,
    name: 'Andi & Sara',
    attendance: 'hadir',
    comment: 'Selamat menempuh hidup baru J & M! Semoga cinta kalian selalu mekar seperti bunga di taman surga. Kami sangat senang bisa hadir!',
    createdAt: DateTime.now().minus({ hours: 2 }),
  },
  {
    id: 2,
    invitationId,
    name: 'Ibu Ratna',
    attendance: 'tidak',
    comment: 'Doa terbaik untuk kalian berdua. Maaf Ibu tidak bisa hadir secara langsung, namun doa Ibu menyertai langkah kalian berdua.',
    createdAt: DateTime.now().minus({ days: 1 }),
  },
  {
    id: 3,
    invitationId,
    name: 'Keluarga Sudarsono',
    attendance: 'hadir',
    comment: 'Barakallah, semoga menjadi keluarga yang sakinah, mawaddah, dan warahmah. Sangat terharu melihat perjalanan kalian.',
    createdAt: DateTime.now().minus({ days: 2 }),
  },
]

// Volatile memory storage for new mock guest RSVPs (simulates database writes for the demo)
export const volatileRSVPs: { [invitationId: number]: MockGuest[] } = {
  1: [],
  2: []
}

export const getMockInvitations = (): MockInvitation[] => {
  // Set dates in the future (+1 year) so countdown is active
  const nextYear = DateTime.now().plus({ days: 365 })
  const akadTime = nextYear.set({ hour: 8, minute: 0, second: 0, millisecond: 0 })
  const resepsiTime = nextYear.set({ hour: 11, minute: 0, second: 0, millisecond: 0 })
  const resepsiTimeModern = nextYear.set({ hour: 19, minute: 0, second: 0, millisecond: 0 })

  const javaInv: MockInvitation = {
    id: 1,
    slug: 'juliana-muhammad',
    brideName: 'Juliana Saputri',
    brideNickname: 'Juliana',
    brideParentFather: 'Bapak Ahmad Santoso',
    brideParentMother: 'Ibu Siti Maryam',
    groomName: 'Muhammad Pratama',
    groomNickname: 'Muhammad',
    groomParentFather: 'Bapak H. Ridwan Jaya',
    groomParentMother: 'Ibu Hj. Kartika',
    akadDatetime: akadTime,
    resepsiDatetime: resepsiTime,
    eventLocation: 'Gedung Krama Jawi',
    eventAddress: 'Jl. Sosrowijayan No. 12, Yogyakarta',
    googleMapsUrl: 'https://maps.app.goo.gl/uX73Y69aR8d',
    bankName: 'Bank Mandiri',
    bankAccountNumber: '123 4567 890',
    bankAccountHolder: 'Muhammad Pratama',
    walletName: 'GoPay',
    walletNumber: '0812 3456 7890',
    walletHolder: 'Juliana Saputri',
    bgMusicUrl: '/audio/gamelan.mp3',
    style: 'java_style',
    stories: mockStories(1),
    galleries: mockGalleries(1),
    guests: [...mockGuests(1), ...(volatileRSVPs[1] || [])]
  }

  const modernInv: MockInvitation = {
    id: 2,
    slug: 'juliana-muhammad-editorial',
    brideName: 'Juliana Saputri',
    brideNickname: 'Juliana',
    brideParentFather: 'Bapak Ahmad Santoso',
    brideParentMother: 'Ibu Siti Maryam',
    groomName: 'Muhammad Pratama',
    groomNickname: 'Muhammad',
    groomParentFather: 'Bapak H. Ridwan Jaya',
    groomParentMother: 'Ibu Hj. Kartika',
    akadDatetime: akadTime,
    resepsiDatetime: resepsiTimeModern,
    eventLocation: 'The Glass House',
    eventAddress: 'Jl. Sukajadi No. 102, Bandung',
    googleMapsUrl: 'https://maps.app.goo.gl/uX73Y69aR8d',
    bankName: 'Citibank NA',
    bankAccountNumber: '8842 1902 0031 4452',
    bankAccountHolder: 'Muhammad Pratama',
    walletName: 'OVO',
    walletNumber: '0812 3456 7890',
    walletHolder: 'Juliana Saputri',
    bgMusicUrl: '/audio/gamelan.mp3',
    style: 'image_sequence',
    stories: mockStories(2),
    galleries: mockGalleries(2),
    guests: [...mockGuests(2), ...(volatileRSVPs[2] || [])]
  }

  return [javaInv, modernInv]
}

export const getMockInvitationBySlug = (slug: string): MockInvitation | undefined => {
  const all = getMockInvitations()
  
  // Try matching directly
  const exactMatch = all.find(inv => inv.slug === slug)
  if (exactMatch) return exactMatch

  // Fail-safe: if the slug is not directly matched (e.g. if the user enters legacy slugs),
  // map modern paths to modern layout and java paths to java layout
  if (slug.includes('editorial')) {
    return all[1]
  }
  return all[0]
}
