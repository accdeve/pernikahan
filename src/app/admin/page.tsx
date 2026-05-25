'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { getMockInvitations, MockInvitation, MockStory, MockGallery, MockGuest } from '@/services/mockData'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'stories' | 'gallery' | 'guests'>('overview')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  // Dynamic In-Session State
  const [invitation, setInvitation] = useState<MockInvitation | null>(null)
  const [stories, setStories] = useState<MockStory[]>([])
  const [galleries, setGalleries] = useState<MockGallery[]>([])
  const [guests, setGuests] = useState<MockGuest[]>([])

  // Invitation Form Inputs
  const [brideName, setBrideName] = useState('')
  const [brideNickname, setBrideNickname] = useState('')
  const [groomName, setGroomName] = useState('')
  const [groomNickname, setGroomNickname] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventAddress, setEventAddress] = useState('')

  // Love Story Form Inputs
  const [storyDate, setStoryDate] = useState('')
  const [storyTitle, setStoryTitle] = useState('')
  const [storyDesc, setStoryDesc] = useState('')
  const [storyImage, setStoryImage] = useState('')

  // Gallery Form Inputs
  const [galleryCaption, setGalleryCaption] = useState('')
  const [galleryImage, setGalleryImage] = useState('')

  useEffect(() => {
    setMounted(true)
    const isLoggedIn = localStorage.getItem('is_admin_logged_in') === 'true'
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    // Initialize mock data
    const mockInv = getMockInvitations()[0]
    setInvitation(mockInv)
    setStories(mockInv.stories)
    setGalleries(mockInv.galleries)
    setGuests(mockInv.guests)

    // Form inputs
    setBrideName(mockInv.brideName)
    setBrideNickname(mockInv.brideNickname)
    setGroomName(mockInv.groomName)
    setGroomNickname(mockInv.groomNickname)
    setEventLocation(mockInv.eventLocation)
    setEventAddress(mockInv.eventAddress)
  }, [router])

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg)
    setTimeout(() => setAlertMessage(null), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem('is_admin_logged_in')
    router.push('/admin/login')
  }

  // A. Update details handler
  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return
    
    const updated = {
      ...invitation,
      brideName,
      brideNickname,
      groomName,
      groomNickname,
      eventLocation,
      eventAddress,
    }
    setInvitation(updated)
    triggerAlert('Informasi undangan pernikahan berhasil diperbarui! (Simulasi Sesi)')
  }

  // B. Stories handler
  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyDate || !storyTitle || !storyDesc) return

    const newStory: MockStory = {
      id: Date.now(),
      invitationId: invitation?.id || 1,
      milestoneDate: storyDate.toUpperCase(),
      title: storyTitle,
      description: storyDesc,
      imageUrl: storyImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
      sortOrder: stories.length + 1
    }

    setStories([...stories, newStory])
    setStoryDate('')
    setStoryTitle('')
    setStoryDesc('')
    setStoryImage('')
    triggerAlert('Momen cerita cinta berhasil ditambahkan!')
  }

  const handleDeleteStory = (id: number) => {
    setStories(stories.filter(s => s.id !== id))
    triggerAlert('Momen cerita cinta berhasil dihapus!')
  }

  // C. Gallery handler
  const handleCreateGallery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!galleryImage) return

    const newPhoto: MockGallery = {
      id: Date.now(),
      invitationId: invitation?.id || 1,
      imageUrl: galleryImage,
      caption: galleryCaption || 'Momen Bahagia',
      sortOrder: galleries.length + 1
    }

    setGalleries([...galleries, newPhoto])
    setGalleryCaption('')
    setGalleryImage('')
    triggerAlert('Foto galeri berhasil ditambahkan!')
  }

  const handleDeleteGallery = (id: number) => {
    setGalleries(galleries.filter(g => g.id !== id))
    triggerAlert('Foto galeri berhasil dihapus!')
  }

  // D. Guest/RSVP Moderation handler
  const handleDeleteGuest = (id: number) => {
    setGuests(guests.filter(g => g.id !== id))
    triggerAlert('Data tamu / ucapan berhasil dihapus!')
  }

  if (!mounted || !invitation) return null

  // Calculations
  const totalGuests = guests.length
  const attendingCount = guests.filter(g => g.attendance === 'hadir').length
  const decliningCount = guests.filter(g => g.attendance === 'tidak').length

  return (
    <div 
      className="w-full min-h-screen text-[#eae1d4]" 
      style={{
        background: 'radial-gradient(circle at 50% 50%, #15110a 0%, #080604 100%)',
        padding: '3rem 1.5rem',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header Dashboard */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-[rgba(242,202,80,0.15)] pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-serif text-gold text-3xl" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined text-gold" style={{ fontSize: '32px' }}>dashboard</span>
              <span>Workstation Admin</span>
            </h1>
            <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>Selamat datang kembali, Administrator pernikahan.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="btn-admin-access" style={{ padding: '0.5rem 1rem' }}>
              <span className="material-symbols-outlined">home</span>
              <span>Lihat Web</span>
            </Link>
            <button onClick={handleLogout} className="btn-copy-gold" style={{ border: '1px solid #e57373', color: '#e57373', borderRadius: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Global Floating Alert Message */}
        {alertMessage && (
          <div 
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg text-center font-bold"
            style={{
              backgroundColor: 'rgba(242, 202, 80, 0.95)',
              border: '1px solid #f2ca50',
              color: '#3c2f00',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              animation: 'heartbeat 0.3s ease',
            }}
          >
            {alertMessage}
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex flex-wrap gap-2 border-b border-[rgba(242,202,80,0.08)] pb-4 mb-8">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`btn-admin-access ${activeTab === 'overview' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <span className="material-symbols-outlined">insights</span>
            <span>Ringkasan</span>
          </button>
          <button 
            onClick={() => setActiveTab('details')} 
            className={`btn-admin-access ${activeTab === 'details' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <span className="material-symbols-outlined">edit_note</span>
            <span>Detail Undangan</span>
          </button>
          <button 
            onClick={() => setActiveTab('stories')} 
            className={`btn-admin-access ${activeTab === 'stories' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <span className="material-symbols-outlined">history_edu</span>
            <span>Cerita Cinta</span>
          </button>
          <button 
            onClick={() => setActiveTab('gallery')} 
            className={`btn-admin-access ${activeTab === 'gallery' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <span className="material-symbols-outlined">image</span>
            <span>Galeri Foto</span>
          </button>
          <button 
            onClick={() => setActiveTab('guests')} 
            className={`btn-admin-access ${activeTab === 'guests' ? 'active' : ''}`}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            <span className="material-symbols-outlined">group</span>
            <span>Moderasi Tamu</span>
          </button>
        </div>

        {/* Tab Contents */}
        <main className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card text-center" style={{ padding: '2rem' }}>
                  <span className="material-symbols-outlined text-gold" style={{ fontSize: '3rem' }}>forum</span>
                  <h3 className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>TOTAL UCAPAN</h3>
                  <p className="font-serif text-white mt-1" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalGuests}</p>
                </div>
                <div className="glass-card text-center" style={{ padding: '2rem' }}>
                  <span className="material-symbols-outlined text-gold" style={{ fontSize: '3rem' }}>check_circle</span>
                  <h3 className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>TAMU HADIR</h3>
                  <p className="font-serif text-white mt-1" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#81c784' }}>{attendingCount}</p>
                </div>
                <div className="glass-card text-center" style={{ padding: '2rem' }}>
                  <span className="material-symbols-outlined text-gold" style={{ fontSize: '3rem' }}>cancel</span>
                  <h3 className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>TIDAK HADIR</h3>
                  <p className="font-serif text-white mt-1" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e57373' }}>{decliningCount}</p>
                </div>
              </div>

              {/* Event Info Details */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Informasi Event Undangan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-serif" style={{ fontSize: '1.25rem', color: '#fff' }}>
                      {invitation.brideNickname} &amp; {invitation.groomNickname}
                    </p>
                    <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                      <strong>Lokasi Resepsi:</strong> {invitation.eventLocation}
                    </p>
                    <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>
                      <strong>Alamat:</strong> {invitation.eventAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      <strong>Tanggal Akad:</strong> {DateTime.fromISO(invitation.akadDatetime).setLocale('id').toFormat('dd MMMM yyyy, HH:mm')} WIB
                    </p>
                    <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>
                      <strong>Tanggal Resepsi:</strong> {DateTime.fromISO(invitation.resepsiDatetime).setLocale('id').toFormat('dd MMMM yyyy, HH:mm')} WIB
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Guests List */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Ucapan Terbaru</h3>
                <div className="space-y-4">
                  {guests.slice(0, 5).map((guest) => (
                    <div key={guest.id} className="comment-card-heritage" style={{ borderLeft: '3px solid #f2ca50' }}>
                      <div className="flex justify-between items-baseline" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong className="text-gold">{guest.name}</strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {guest.createdAt ? DateTime.fromISO(guest.createdAt).toFormat('dd MMM yyyy, HH:mm') : ''}
                        </span>
                      </div>
                      <p className="text-muted mt-1">"{guest.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {activeTab === 'details' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Edit Detail Undangan</h3>
              <form onSubmit={handleUpdateDetails} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group space-y-2">
                    <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>NAMA MEMPELAI WANITA</label>
                    <input 
                      type="text" 
                      className="form-control-heritage" 
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group space-y-2">
                    <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>NAMA PANGGILAN WANITA</label>
                    <input 
                      type="text" 
                      className="form-control-heritage" 
                      value={brideNickname}
                      onChange={(e) => setBrideNickname(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group space-y-2">
                    <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>NAMA MEMPELAI PRIA</label>
                    <input 
                      type="text" 
                      className="form-control-heritage" 
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group space-y-2">
                    <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>NAMA PANGGILAN PRIA</label>
                    <input 
                      type="text" 
                      className="form-control-heritage" 
                      value={groomNickname}
                      onChange={(e) => setGroomNickname(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group space-y-2">
                  <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>NAMA GEDUNG ACARA</label>
                  <input 
                    type="text" 
                    className="form-control-heritage" 
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group space-y-2">
                  <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>ALAMAT ACARA</label>
                  <input 
                    type="text" 
                    className="form-control-heritage" 
                    value={eventAddress}
                    onChange={(e) => setEventAddress(e.target.value)}
                    required 
                  />
                </div>

                <button className="btn-send-heritage mt-6" type="submit">
                  <span className="material-symbols-outlined text-on-primary">save</span>
                  <span className="font-label-caps text-on-primary">SIMPAN DETAIL</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: STORIES */}
          {activeTab === 'stories' && (
            <div className="space-y-6">
              {/* Form Create Story */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Tambah Cerita Cinta</h3>
                <form onSubmit={handleCreateStory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group space-y-2">
                      <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>TANGGAL MILESTONE (Contoh: MEI 2026)</label>
                      <input 
                        type="text" 
                        className="form-control-heritage" 
                        placeholder="SEPTEMBER 2021" 
                        value={storyDate}
                        onChange={(e) => setStoryDate(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group space-y-2">
                      <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>JUDUL ACARA</label>
                      <input 
                        type="text" 
                        className="form-control-heritage" 
                        placeholder="Awal Berjumpa" 
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group space-y-2">
                    <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>URL GAMBAR MOCKUP</label>
                    <input 
                      type="url" 
                      className="form-control-heritage" 
                      placeholder="https://images.unsplash.com/..." 
                      value={storyImage}
                      onChange={(e) => setStoryImage(e.target.value)}
                    />
                  </div>

                  <div className="form-group space-y-2">
                    <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>DESKRIPSI KISAH</label>
                    <textarea 
                      className="form-control-heritage" 
                      placeholder="Tuliskan cerita singkat tentang momen ini..." 
                      rows={3} 
                      value={storyDesc}
                      onChange={(e) => setStoryDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button className="btn-send-heritage mt-6" type="submit">
                    <span className="material-symbols-outlined text-on-primary">add</span>
                    <span className="font-label-caps text-on-primary">TAMBAH KISAH</span>
                  </button>
                </form>
              </div>

              {/* Stories List */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Daftar Cerita Cinta Aktif</h3>
                <div className="space-y-4">
                  {stories.map((story) => (
                    <div 
                      key={story.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-[rgba(242,202,80,0.08)] rounded-lg gap-4"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    >
                      <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img 
                          src={story.imageUrl} 
                          alt={story.title} 
                          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(242,202,80,0.15)' }} 
                        />
                        <div>
                          <strong className="text-gold" style={{ fontSize: '0.85rem' }}>{story.milestoneDate}</strong>
                          <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{story.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: '#99907c', maxWidth: '400px' }} className="truncate">{story.description}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteStory(story.id)}
                        className="btn-copy-gold"
                        style={{ border: '1px solid #e57373', color: '#e57373' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                        <span>Hapus</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Form Add Photo */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Tambah Foto Galeri</h3>
                <form onSubmit={handleCreateGallery} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group space-y-2">
                      <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>URL GAMBAR PORTRAIT/LANDSCAPE</label>
                      <input 
                        type="url" 
                        className="form-control-heritage" 
                        placeholder="https://images.unsplash.com/..." 
                        value={galleryImage}
                        onChange={(e) => setGalleryImage(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group space-y-2">
                      <label className="font-label-caps block text-on-surface-variant" style={{ fontSize: '0.75rem' }}>CAPTION FOTO (Keterangan)</label>
                      <input 
                        type="text" 
                        className="form-control-heritage" 
                        placeholder="Batik Keagungan" 
                        value={galleryCaption}
                        onChange={(e) => setGalleryCaption(e.target.value)}
                      />
                    </div>
                  </div>

                  <button className="btn-send-heritage mt-6" type="submit">
                    <span className="material-symbols-outlined text-on-primary">add_a_photo</span>
                    <span className="font-label-caps text-on-primary">TAMBAH FOTO</span>
                  </button>
                </form>
              </div>

              {/* Gallery Photos List */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Daftar Foto Galeri Aktif</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleries.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-2 border border-[rgba(242,202,80,0.08)] rounded-lg text-center"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.caption} 
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} 
                      />
                      <p style={{ fontSize: '0.8rem', color: '#eae1d4', fontWeight: 'bold' }}>{item.caption}</p>
                      <button 
                        onClick={() => handleDeleteGallery(item.id)}
                        className="btn-copy-gold mt-2 w-full justify-center"
                        style={{ border: '1px solid #e57373', color: '#e57373', padding: '0.25rem 0.5rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>delete</span>
                        <span>Hapus</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GUESTS MODERATION */}
          {activeTab === 'guests' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 className="font-serif text-gold text-xl mb-4 border-b border-[rgba(242,202,80,0.08)] pb-2">Moderasi Buku Tamu RSVP</h3>
              <div className="space-y-4">
                {guests.map((guest) => (
                  <div 
                    key={guest.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-[rgba(242,202,80,0.08)] rounded-lg gap-4"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <div>
                      <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{guest.name}</strong>
                        <span 
                          className="px-2 py-0.5 rounded" 
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            backgroundColor: guest.attendance === 'hadir' ? 'rgba(129, 199, 132, 0.1)' : 'rgba(229, 115, 115, 0.1)',
                            color: guest.attendance === 'hadir' ? '#81c784' : '#e57373',
                            border: guest.attendance === 'hadir' ? '1px solid rgba(129, 199, 132, 0.3)' : '1px solid rgba(229, 115, 115, 0.3)',
                          }}
                        >
                          {guest.attendance === 'hadir' ? 'HADIR' : 'TIDAK HADIR'}
                        </span>
                      </div>
                      <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>"{guest.comment}"</p>
                      <span className="text-muted block mt-2" style={{ fontSize: '0.7rem' }}>
                        dikirim pada: {guest.createdAt ? DateTime.fromISO(guest.createdAt).toFormat('dd MMM yyyy, HH:mm') : ''}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="btn-copy-gold"
                      style={{ border: '1px solid #e57373', color: '#e57373' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete_forever</span>
                      <span>Hapus</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
